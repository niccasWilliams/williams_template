import { MAX_UPLOAD_IMAGE_SIZE, applicationName } from "@/app-config";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  updateUser,
  verifyPassword,
} from "@/data-access/users";
import { UserId, UserSession } from "@/use-cases/types";
import { createUUID } from "@/util/uuid";
import { env } from "@/env";
import {
  createAccount,
  createAccountViaGoogle,
  updatePassword,
} from "@/data-access/accounts";
import {
  uniqueNamesGenerator,
  Config,
  colors,
  animals,
} from "unique-names-generator";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "@/data-access/profiles";
import { GoogleUser } from "@/app/api/login/google/callback/route";
import { sendEmail } from "@/lib/send-email";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  getPasswordResetToken,
} from "@/data-access/reset-tokens";
import { ResetPasswordEmail } from "@/emails/reset-password";
import {
  createVerifyEmailToken,
  deleteVerifyEmailToken,
  getVerifyEmailToken,
} from "@/data-access/verify-email";
import { VerifyEmail } from "@/emails/verify-email";
import { createTransaction } from "@/data-access/utils";
import { LoginError } from "./errors";
import { deleteSessionForUser } from "@/data-access/sessions";
import { getFileUrl, uploadFileToBucket } from "@/lib/files";
import { Profile } from "@/db/schema";

export async function deleteUserUseCase(
  authenticatedUser: UserSession,
  userToDeleteId: UserId
): Promise<void> {
  if (authenticatedUser.id !== userToDeleteId) {
    throw new Error("You can only delete your own account");
  }

  await deleteUser(userToDeleteId);
}


export async function getUserProfileUseCase(userId: UserId) {
  const profile = await getProfile(userId);

  if (!profile) {
    throw new Error("User not found");
  }

  return profile;
}

export async function registerUserUseCase(email: string, password: string) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("An user with that email already exists.");
  }
  const user = await createUser(email);
  await createAccount(user.id, password);

  const displayName = uniqueNamesGenerator({
    dictionaries: [colors, animals],
    separator: " ",
    style: "capital",
  });
  await createProfile(user.id, displayName);

  const token = await createVerifyEmailToken(user.id);
  await sendEmail(
    email,
    `Verify your email for ${applicationName}`,
    <VerifyEmail token={token} />
  );

  return { id: user.id };
}

export async function signInUseCase(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new LoginError();
  }

  const isPasswordCorrect = await verifyPassword(email, password);

  if (!isPasswordCorrect) {
    throw new LoginError();
  }

  return { id: user.id };
}





//TODO: change this into s3 bucket image upload


//IMAGE
export function getProfileImageKey(userId: UserId, imageId: string) {
  return `users/${userId}/images/${imageId}`;
}

//IMAGE
export async function updateProfileImageUseCase(file: File, userId: UserId) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File should be an image.");
  }

  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    throw new Error("File size should be less than 5MB.");
  }

  const imageId = createUUID();

  await uploadFileToBucket(file, getProfileImageKey(userId, imageId));
  await updateProfile(userId, { imageId });
}

//IMAGE
export function getProfileImageUrl(userId: UserId, imageId: string) {
  return `${env.HOST_NAME}/api/users/${userId}/images/${imageId ?? "default"}`;
}

//IMAGE
export function getDefaultImage(userId: UserId) {
  return `${env.HOST_NAME}/api/users/${userId}/images/default`;
}

//IMAGE
export async function getProfileImageUrlUseCase({
  userId,
  imageId,
}: {
  userId: UserId;
  imageId: string;
}) {
  const url = await getFileUrl({
    key: getProfileImageKey(userId, imageId),
  });

  return url;
}

export async function getProfileImageFullUrl(profile: Profile): Promise<string> {
  if (profile.imageId) {
    return await getProfileImageUrlUseCase({
      userId: profile.userId,
      imageId: profile.imageId,
    });
  }

  if (profile.image) {
    return profile.image;
  }

  return "/profile.png";
}







export async function updateProfileBioUseCase(userId: UserId, bio: string) {
  await updateProfile(userId, { bio });
}

export async function updateProfileNameUseCase(
  userId: UserId,
  displayName: string
) {
  await updateProfile(userId, { displayName });
}

export async function createGoogleUserUseCase(googleUser: GoogleUser) {
  let existingUser = await getUserByEmail(googleUser.email);

  if (!existingUser) {
    existingUser = await createUser(googleUser.email);
  }

  await createAccountViaGoogle(existingUser.id, googleUser.sub);

  await createProfile(existingUser.id, googleUser.name, googleUser.picture);

  return existingUser.id;
}

export async function resetPasswordUseCase(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const token = await createPasswordResetToken(user.id);

  await sendEmail(
    email,
    `Your password reset link for ${applicationName}`,
    <ResetPasswordEmail token={token} />
  );
}

export async function changePasswordUseCase(token: string, password: string) {
  const tokenEntry = await getPasswordResetToken(token);

  if (!tokenEntry) {
    throw new Error("Invalid token");
  }

  const userId = tokenEntry.userId;

  await createTransaction(async (trx) => {
    await deletePasswordResetToken(token, trx);
    await updatePassword(userId, password, trx);
    await deleteSessionForUser(userId, trx);
  });
}

export async function verifyEmailUseCase(token: string) {
  const tokenEntry = await getVerifyEmailToken(token);

  if (!tokenEntry) {
    throw new Error("Invalid token");
  }

  const userId = tokenEntry.userId;

  await updateUser(userId, { emailVerified: new Date() });
  await deleteVerifyEmailToken(token);
  return userId;
}

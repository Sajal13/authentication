'use server';

import { redirect } from 'next/navigation';
import { BACKEND_URL } from './constants';
import { FormState, SignInFormSchema, SignupFormSchema } from './type';
import { createSession } from './session';

export async function signUp(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validationFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!validationFields.success) {
    const error = validationFields.error.flatten();
    return {
      error: {
        name: error.fieldErrors.name?.[0],
        email: error.fieldErrors.email?.[0],
        password: error.fieldErrors.password
      }
    };
  }
  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validationFields.data)
  });

  if (response.ok) {
    redirect('/auth/signin');
  } else {
    return {
      message:
        response.status === 409 ? 'User already exists' : response.statusText
    };
  }
}

export async function signin(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validationFields = SignInFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!validationFields.success) {
    const error = validationFields.error.flatten();
    return {
      error: {
        email: error.fieldErrors.email?.[0],
        password: error.fieldErrors.password
      }
    };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(validationFields.data)
  });

  if (response.ok) {
    const result = await response.json();

    await createSession({
      user: {
        id: result.id,
        name: result.name
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
    redirect('/');
  } else {
    return {
      message:
        response.status === 401 ? 'Invalid Credentials' : response.statusText
    };
  }
}

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: oldRefreshToken })
    });

    if (!response.ok) { 
      throw new Error(`Failed to refresh token ${response.statusText}`)
    };

    const { accessToken, refreshToken } = await response.json();

    const updateRes = await fetch(`http://localhost:3000/api/auth/update`, {
      method: 'POST',
      body: JSON.stringify({ accessToken, refreshToken })
    });

    if (!updateRes.ok)
      throw new Error("Failed to update the token");
    return accessToken
  } catch (err) {
    console.log(err);
    return null;
  }
};

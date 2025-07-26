import React from 'react';
import SignInForm from './SignInForm';
import Link from 'next/link';
import { BACKEND_URL } from '@/lib/constants';

const page = () => {
  return (
    <div className="flex w-96 flex-col items-center justify-center rounded-lg bg-white p-8 shadow-lg">
      <h1 className="mb-4 text-center text-2xl font-bold">Sign Up Page</h1>
      <SignInForm />
      <div className="flex justify-between text-sm mb-2">
        <p>Already have an account?</p>
        <Link className="underline" href={'/auth/signin'}>
          Sign In
        </Link>
      </div>
      <a href={`${BACKEND_URL}/auth/google/login`}>Login With Google</a>
    </div>
  )
}

export default page;

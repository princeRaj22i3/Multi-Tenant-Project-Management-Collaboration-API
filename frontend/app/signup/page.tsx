'use client';
import React, { useState } from 'react';
import './signup.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type Inputs = {
  username: string;
  password: string;
};

const Signup: React.FC = () => {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const delay = (s: number) => new Promise<void>(resolve => setTimeout(resolve, s * 1000));

  const router = useRouter();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setServerMsg(null);
    setServerError(null);
    try {
      await delay(1);
      const response = await fetch('http://localhost:3001/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        setServerError(res.msg || 'Signup failed');
        return;
      }

      setServerMsg(res.msg);
      await delay(1.5);
      router.push('/login')
      
    } catch (err) {
      console.error(err);
      setServerError('Something went wrong. Try again.');
    }
  };

  return (
    <div className='signupBody'>
      <div className='containerDiv'>
        <h2>Sign Up</h2>
        <div className='signupDiv'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                className='inputParamsSignup'
                type="text"
                placeholder="USERNAME"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && <span className="errorText">{errors.username.message}</span>}
            </div>

            <div>
              <input
                className='inputParamsSignup'
                type="password"
                placeholder="PASSWORD"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="errorText">{errors.password.message}</span>}
            </div>

            <div>
              <input
                className='submitParamsSignup'
                type="submit"
                value={isSubmitting ? 'Submitting...' : 'SUBMIT'}
                disabled={isSubmitting}
              />
            </div>
          </form>

          {serverMsg && <div className="successText">{serverMsg}</div>}
          {serverError && <div className="errorText">{serverError}</div>}
        </div>
      </div>
    </div>
  );
};

export default Signup;

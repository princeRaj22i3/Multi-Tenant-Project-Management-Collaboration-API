'use client';
import React, { useState } from 'react';
import './login.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type Inputs = {
  username: string;
  password: string;
};

const Login: React.FC = () => {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const router = useRouter();

  const delay = (s: number) => new Promise<void>(resolve => setTimeout(resolve, s * 1000));

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setServerMsg(null);
    setServerError(null);
    try {
      await delay(1);
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const res = await response.json();

      if (!response.ok) {
        setServerError(res.msg || 'Invalid username or password');
        return;
      }

      setServerMsg('Login successful!');
    } catch (err) {
      console.error(err);
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='loginBody'>
      <div className='containerDivLogin'>
        <h2>Login</h2>
        <div className='loginDiv'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                className='inputParamsLogin'
                type="text"
                placeholder="USERNAME"
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && <span className="errorText">{errors.username.message}</span>}
            </div>

            <div>
              <input
                className='inputParamsLogin'
                type="password"
                placeholder="PASSWORD"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="errorText">{errors.password.message}</span>}
            </div>

            <div>
              <input
                className='submitParamsLogin'
                type="submit"
                value={isSubmitting ? 'Logging in...' : 'LOGIN'}
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

export default Login;

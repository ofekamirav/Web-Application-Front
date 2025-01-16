import { FC } from 'react';
//import { useForm } from 'react-hook-form';
//import z from 'zod';
import '../Styles/Register.css';
import googleIcon from '../assets/google_login_icon.png';
//import { zodResolver } from '@hookform/resolvers/zod';


/*
const schema = z.object({
  email: z.string().email().nonempty({ message: 'Email is required' }),
  name: z.string().nonempty({ message: 'Name is required' }).min(3, { message: 'Name must be atleast 3 characters long' }),
  phone: z.string().nonempty({ message: 'Phone is required' }).min(10, { message: 'Phone must be atleast 10 characters long' }),
  password: z.string().nonempty({ message: 'Password is required' }).min(6, { message: 'Password must be atleast 6 characters long' }),
  repassword: z.string().nonempty({ message: 'Password is required' }).min(6).refine(data => data === schema.password, { message: 'Passwords do not match' }),
});*/

//type FormDate = z.infer<typeof schema>;

  const Register: FC = () => {
    //const { /*register,*/ handleSubmit, formState/*: { errors }*/ } = useForm<FormData>({ resolver: zodResolver(schema) });

/*
  const onSubmit=(data:FormDate)=>{
    console.log(data);
  }
*/
  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">
          Welcome to <span className="brand-name">RecipeHub</span>
        </h1>
        <p className="register-subtitle">
          Please sign up in to continue
        </p>

        <button className="google-login-btn">
          <img
            src={googleIcon}
            alt="Google Logo"
            className="google-logo"
          />
          Sign up with Google
        </button>

        <form /*onSubmit={handleSubmit(onSubmit)}*/ className="register-form">
          <div className="form-group">
            <label htmlFor="email">Enter your email address</label>
            <input
              //{...register('email')}
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Email address"/>
          </div>
          <div className="name-phone-row">
            <div className="form-group">
              <label htmlFor="name">Enter your Name</label>
              <input
                //{...register('name')}
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Full Name"/>                
            </div>
            <div className="form-group">
              <label htmlFor="phone">Enter your Phone</label>
              <input
                //{...register('phone')}
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                placeholder="Phone Number" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Enter your Password</label>
            <input
              //{...register('password')}
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Password" />
          </div>
          <div className="form-group">
            <label htmlFor="repassword">Re-enter your Password</label>
            <input
              //{...register('repassword')}
              type="password"
              id="repassword"
              name="repassword"
              className="form-input"
              placeholder="Password" />
          </div>
          <div className="form-footer">
            <label>
              <input type="checkbox" required />
              I agree to the <a href="/terms-and-conditions" className="terms-and-conditions">terms and conditions</a>
            </label>
          </div>
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        <div className="login-footer">
          <span>Already have an Account? </span>
          <a href="/login" className="login-link">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
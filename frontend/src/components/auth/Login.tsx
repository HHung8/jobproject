import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import { useState } from 'react'
import { ILoginState } from '@/types/user'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/contant'
import { toast } from 'sonner'

const Login = () => {
  const [input, setInput] = useState<ILoginState>({
    email:"",
    password:"",
    role:""
  })
  const navigate = useNavigate();
  const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput({...input, [e.target.name]: e.target.value});
  }
  
  const submitHandler = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
        headers: {
          "Content-Type":"application/json"
        },
        withCredentials:true,
      });
      if(res.data.success) { 
          navigate("/");
          toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  }


  return (
    <div>
        <Navbar />
        <div className='flex items-center justify-center max-w-7xl mx-auto'>
            <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                <h1 className='font-bold text-xl mb-5'>Sign Up</h1>
                <div className='my-2'>
                    <Label>Email</Label>
                    <Input 
                      type='email' 
                      value={input.email}
                      onChange={changeEventHandler}
                      name='email'
                      placeholder='yushing@gmail.com' 
                    />
                </div>
                <div className='my-2'>
                    <Label>Password</Label>
                    <Input 
                      type='password' 
                      value={input.password}
                      onChange={changeEventHandler}
                      name='password'
                      placeholder='Abc@123'
                    />
                </div>
                <div className='flex items-center justify-between'>
                    <RadioGroup className='flex items-center gap-4 my-5'>
                          <div className='flex items-center space-x-2'>
                              <Input 
                                type='radio' 
                                name='role' 
                                value="STUDENT" 
                                checked={input.role === "STUDENT"}
                                onChange={changeEventHandler}
                                className='cursor-pointer' 
                              />
                              <Label htmlFor='r1'>STUDENT</Label>
                          </div>
                          <div className='flex items-center space-x-2'>
                              <Input 
                                type='radio' 
                                name='role' 
                                value="RECRUITER" 
                                checked={input.role === 'RECRUITER'}
                                onChange={changeEventHandler}
                                className='cursor-pointer' 
                              />
                              <Label htmlFor="r2">RECRUITER</Label>
                          </div>
                    </RadioGroup>
                </div>
                <Button type='submit' className='w-full my-4 bg-black text-white'>Login</Button>
                <span className='text-sm'>Don't have an account? <Link to="/signup" className='text-blue-600'>SignUp</Link></span>
            </form>
        </div>
    </div>
  )
}

export default Login  
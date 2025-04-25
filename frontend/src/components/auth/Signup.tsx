import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { InputState } from '@/types/user';
import React, { useState } from 'react';
import axios from "axios";
import { USER_API_END_POINT } from '@/utils/contant';
import { toast } from 'sonner';

const SignUp = () => {
    const [input, setInput] = useState<InputState>({
        fullname:"",
        email:"",
        phoneNumber:"",
        password:"",
        role:"",
        file: null,
    });
    const navigate = useNavigate();
    const changeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput({...input, [e.target.name]: e.target.value})
    }

    const changeFileHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput({...input, file: e.target.files?.[0] || null});
    }
    
    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("password", input.password);
        formData.append("phoneNumber", input.password);
        formData.append("role", input.role);
        if(input.file) {
            formData.append("file", input.file);
        }
        try {
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers:{
                    "Content-Type":"multipart/form-data"
                },
                withCredentials:true,
            });
            if(res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error: unknown) {
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
                    <Label>Full Name</Label>
                    <Input 
                        type='text'
                        value={input.fullname}
                        name='fullname'
                        onChange={changeEventHandler}
                        placeholder='patel' 
                    />
                </div>
                <div className='my-2'>
                    <Label>Email</Label>
                    <Input 
                        type='email' 
                        value={input.email}
                        name='email'
                        onChange={changeEventHandler}
                        placeholder='patel@gmail.com' 
                    />
                </div>
                <div className='my-2'>
                    <Label>Phone Number</Label>
                    <Input 
                        type='text' 
                        value={input.phoneNumber}
                        onChange={changeEventHandler}
                        name='phoneNumber'
                        placeholder='09123123455' 
                    />
                </div>
                <div className='my-2'>
                    <Label>Passworrd</Label>
                    <Input 
                        type='password' 
                        value={input.password}
                        onChange={changeEventHandler}
                        name='password'
                        placeholder='Abc123@'
                    />
                </div>
                <div className='flex items-center justify-between'>
                    <RadioGroup className='flex items-center gap-4 my-5 '>
                        <div className="flex items-center space-x-2">
                            <Input 
                                type='radio' 
                                name="role" 
                                value="STUDENT" 
                                className='cursor-pointer' 
                                checked={input.role === 'STUDENT'}
                                onChange={changeEventHandler}
                            />
                            <Label htmlFor="r1">STUDENT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input 
                                type='radio' 
                                name="role" 
                                value="RECRUITER" 
                                className='cursor-pointer' 
                                checked={input.role === 'RECRUITER'}
                                onChange={changeEventHandler}
                            />
                            <Label htmlFor="r2">RECRUITER</Label>
                        </div>
                    </RadioGroup>
                    <div className='flex items-center gap-2'>
                        <Label>Profile</Label>
                        <Input 
                            accept='image/*' 
                            type='file' 
                            onChange={changeFileHandler}
                            className='cursor-pointer'
                        /> 
                    </div>
                </div>
                <Button type='submit' className='w-full my-4 bg-black text-white'>Signup</Button>
                <span className='text-sm'>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
            </form>
        </div>
    </div>
  )
}

export default SignUp

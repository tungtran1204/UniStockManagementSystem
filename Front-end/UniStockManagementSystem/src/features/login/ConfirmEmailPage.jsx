import React, { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { Typography } from "@material-tailwind/react";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    useEffect(() => {
        document.body.style.backgroundImage = 'url(/img/bg.svg)';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'none'
        document.body.style.backgroundPosition = 'center';

        return () => {
            document.body.style.backgroundImage = null;
            document.body.style.backgroundSize = null;
            document.body.style.backgroundPosition = null;
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: xử lý logic gửi yêu cầu quên mật khẩu
        console.log('Email submitted:', email);
    };

    return (
        <div
            className="w-full h-screen flex items-center justify-center bg-cover bg-center"
        >
            <div className="flex items-center justify-center gap-20 w-[1200px] py-20 bg-white shadow-blue-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                <Box className="flex flex-col items-center justify-center p-8 rounded-xl max-w-md h-[500px] w-full bg-[#0ab067]/10">
                    <div className='pb-8'>
                        <Typography variant="h2" className="font-bold text-center ">
                            Quên mật khẩu
                        </Typography>
                        <Typography className='text-sm text-blue-gray-500'>
                            Hãy nhập email đăng ký của bạn để đặt lại mật khẩu
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 w-full px-5">
                        <div>
                            <Typography>Email</Typography>
                            <TextField
                                fullWidth
                                hiddenLable
                                color="success"
                                variant="outlined"
                                size="small"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            className="mt-4"
                            sx={{
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 'none' }
                            }}
                        >
                            Gửi yêu cầu
                        </Button>
                    </form>
                </Box>
                <div className="w-2/5 h-full hidden lg:block">
                    <img
                        src="/img/logo.svg"
                        className="h-full w-full object-cover rounded-3xl"
                    />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

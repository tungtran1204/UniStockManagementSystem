import React, { useState, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { Typography } from "@material-tailwind/react";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

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

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không trùng khớp!');
            return;
        } else {
            setError('');
        }

        console.log('Password submitted:', newPassword);
    };

    return (
        <div
            className="w-full h-screen flex items-center justify-center bg-cover bg-center"
        >
            <div className="flex items-center justify-center gap-20 w-[1200px] py-20 bg-white shadow-blue-gray-900 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                <Box className="flex flex-col items-center justify-center p-8 rounded-xl max-w-md h-[500px] w-full bg-[#0ab067]/10">
                    <div className='pb-8 flex flex-col items-center justify-center'>
                        <Typography variant="h2" className="font-bold text-center ">
                            Đặt lại mật khẩu
                        </Typography>
                        <Typography className='text-sm text-blue-gray-500'>
                            Hãy nhập mật khẩu mới của bạn
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 w-full px-5">
                        <div>
                            <Typography>Mật khẩu mới</Typography>
                            <TextField
                                fullWidth
                                hiddenLable
                                size="small"
                                color="success"
                                variant="outlined"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Typography>Nhập lại mật khẩu</Typography>
                            <TextField
                                fullWidth
                                hiddenLable
                                size="small"
                                color="success"
                                variant="outlined"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={Boolean(error)}
                                helperText={error}
                                required
                            />
                        </div>
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                            GỬI
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

export default ResetPassword;

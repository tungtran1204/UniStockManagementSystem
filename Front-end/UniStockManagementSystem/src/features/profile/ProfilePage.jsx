import React from 'react';
import {
    TextField,
    Button as MuiButton,
    Avatar,
    Chip,
    Link
} from '@mui/material';
import {
    Card,
    Button,
    CardBody,
    Typography,
    Tooltip,
} from "@material-tailwind/react";
import { FaEdit, FaSave } from "react-icons/fa";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PageHeader from '@/components/PageHeader';
import ChangePasswordModal from './ChangePasswordModal';


const Profile = () => {
    const [isEditing, setIsEditing] = React.useState(false);
    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);
    const handleSave = () => setIsEditing(false);
    const [openChangePassword, setOpenChangePassword] = React.useState(false);


    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title="Thông tin tài khoản"
                        showAdd={false}
                        showImport={false}
                        showExport={false}
                    />

                    <div className='flex px-10 gap-20 mb-6 mt-10'>
                        <div className='flex flex-col gap-4 items-center'>
                            <Avatar
                                // alt="Remy Sharp" 
                                // src="/static/images/avatar/1.jpg"
                                sx={{ width: 200, height: 200 }} />
                            <Button
                                size="lg"
                                color="white"
                                className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                                ripple={true}
                                variant="contained"
                            >
                                <div className='flex items-center gap-2'>
                                    <CloudUploadIcon />
                                    <span className='pt-1'>Tải ảnh lên</span>
                                </div>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Họ và tên
                                </Typography>
                                <TextField
                                    size="small"
                                    hiddenLabel
                                    variant="outlined"
                                    color="success"
                                    disabled={!isEditing}
                                    sx={{
                                        width: '500px',
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            bgcolor: '#eeeeee',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                        },
                                    }} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Email
                                </Typography>
                                <TextField
                                    size="small"
                                    hiddenLabel
                                    variant="outlined"
                                    type="email"
                                    color="success"
                                    disabled={!isEditing}
                                    sx={{
                                        width: '500px',
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            bgcolor: '#eeeeee',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                        },
                                    }} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Số điện thoại
                                </Typography>
                                <TextField
                                    size="small"
                                    hiddenLabel
                                    variant="outlined"
                                    color="success"
                                    disabled={!isEditing}
                                    sx={{
                                        width: '500px',
                                        '& .MuiInputBase-root.Mui-disabled': {
                                            bgcolor: '#eeeeee',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none',
                                            },
                                        },
                                    }} />
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Mật khẩu
                                </Typography>
                                <div className='flex items-center gap-8'>
                                    <TextField
                                        size="small"
                                        hiddenLabel
                                        variant="outlined"
                                        color="success"
                                        type="password"
                                        disabled
                                        sx={{
                                            width: '500px',
                                            '& .MuiInputBase-root.Mui-disabled': {
                                                bgcolor: '#eeeeee',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                            },
                                        }}
                                    />
                                    <Link component="button" onClick={() => setOpenChangePassword(true)}>Đổi mật khẩu</Link>
                                </div>
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                                    Vai trò
                                </Typography>
                                <Chip
                                    label="Admin"
                                    variant="outlined"
                                    disabled={!isEditing}
                                    color="primary"
                                ></Chip>
                            </div>
                            <div className="flex justify-end mr-32">
                                {!isEditing ? (
                                    <MuiButton
                                        variant="contained"
                                        size="medium"
                                        onClick={handleEdit}
                                        sx={{
                                            boxShadow: 'none',
                                            '&:hover': { boxShadow: 'none' }
                                        }}
                                    >
                                        <div className='flex items-center gap-2'>
                                            <FaEdit className="h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </div>
                                    </MuiButton>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MuiButton
                                            size="medium"
                                            color="error"
                                            variant="outlined"
                                            onClick={handleCancel}
                                        >
                                            Hủy
                                        </MuiButton>
                                        <Button
                                            size="lg"
                                            color="white"
                                            variant="text"
                                            className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                                            ripple={true}
                                            onClick={handleSave}
                                        >
                                            Lưu
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <ChangePasswordModal
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
                onSave={(currentPwd, newPwd) => {
                    // Gọi API đổi mật khẩu tại đây
                    console.log("Current:", currentPwd, "New:", newPwd);
                }}
            />
        </div>
    );
};

export default Profile;

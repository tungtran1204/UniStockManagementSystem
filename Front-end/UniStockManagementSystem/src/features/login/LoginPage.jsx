import React, { useState } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../features/login/useLogin";

export function LoginPage() {
  const { handleLogin } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email và mật khẩu không được để trống");
      return;
    }

    const result = await handleLogin(email, password);

    if (result.success) {
      const userRoles = result.user?.roles || [];
      console.log("✅ [LoginPage] User Roles:", userRoles);

      if (userRoles.length === 0) {
        console.warn("🚨 [LoginPage] User has no roles! Possible issue with API response.");
      }

      if (userRoles.includes("ADMIN")) {
        navigate("/admin/users");
      } else if (userRoles.includes("MANAGER")) {
        navigate("/dashboard");
      } else {
        navigate("/user/home");
      }
    } else {
      setError(result.message);
    }
  };


  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography>
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleSubmit}>
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          {error && (
            <Typography variant="small" color="red" className="text-center">
              {error}
            </Typography>
          )}
          <Button className="mt-6" fullWidth type="submit">
            Sign In
          </Button>

          <div className="flex items-center justify-between gap-2 mt-6">
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center justify-start font-medium"
                >
                  Subscribe me to newsletter
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Typography variant="small" className="font-medium text-gray-900">
              <a href="#">
                Forgot Password
              </a>
            </Typography>
          </div>
          <div className="space-y-4 mt-8">
            <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1156_824)">
                  <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                  <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                  <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                  <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_1156_824">
                    <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Sign in With Google</span>
            </Button>
            <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth>
              <img src="/img/twitter-logo.svg" height={24} width={24} alt="" />
              <span>Sign in With Twitter</span>
            </Button>
          </div>
          <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
            Not registered?
            <Link to="/auth/sign-up" className="text-gray-900 ml-1">Create account</Link>
          </Typography>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
    </section>
  );
}

export default LoginPage;


// import * as React from "react";
// import {
//   Box,
//   Button,
//   CssBaseline,
//   FormControlLabel,
//   Divider,
//   FormLabel,
//   FormControl,
//   Link,
//   Alert,
//   Stack,
//   Card as MuiCard,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import { Card as TailwindCard, Typography, Input, Checkbox } from "@material-tailwind/react";
// import { useNavigate } from "react-router-dom";
// import useLogin from "../../features/login/useLogin";

// const Card = styled(MuiCard)(({ theme }) => ({
//   display: "flex",
//   flexDirection: "column",
//   alignSelf: "center",
//   width: "100%",
//   padding: theme.spacing(4),
//   gap: theme.spacing(2),
//   margin: "auto",
//   [theme.breakpoints.up("sm")]: {
//     maxWidth: "450px",
//   },
//   boxShadow:
//     "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
// }));

// export default function LoginPage() {
//   const { handleLogin } = useLogin();
//   const [email, setEmail] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [error, setError] = React.useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!email || !password) {
//       setError("Email và mật khẩu không được để trống");
//       return;
//     }

//     const result = await handleLogin(email, password);
//     if (result.success) {
//       const userRoles = result.user?.roles || [];
//       if (userRoles.includes("ADMIN")) {
//         navigate("/admin/users");
//       } else if (userRoles.includes("MANAGER")) {
//         navigate("/dashboard");
//       } else {
//         navigate("/user/home");
//       }
//     } else {
//       setError(result.message);
//     }
//   };

//   return (
//     <Stack direction="column" justifyContent="center" alignItems="center" height="100vh" sx={{ backgroundColor: "#e0f2f1" }}>
//       <CssBaseline />
//       <Card>
//         <div className="text-center">
//           <Typography variant="h2" className="font-bold mb-4">Đăng nhập</Typography>
//         </div>
//         <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//           <FormControl>
//             <FormLabel>
//               <span>Email</span>
//               <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
//             </FormLabel>
//             <Input
//               size="lg"
//               placeholder="name@mail.com"
//               className="!border !border-blue-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 placeholder:opacity-100 focus:!border-green-900 focus:!border-t-green-900 focus:ring-green-900/10"
//               labelProps={{
//                 className: "hidden",
//               }}
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </FormControl>
//           <FormControl>
//             <FormLabel>
//               <span>Mật khẩu</span>
//               <span style={{ color: 'red', marginLeft: '5px' }}>*</span>
//             </FormLabel>
//             <Input
//               type="password"
//               size="lg"
//               placeholder="********"
//               className="!border !border-blue-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 placeholder:opacity-100 focus:!border-green-900 focus:!border-t-green-900 focus:ring-green-900/10"
//               labelProps={{
//                 className: "hidden",
//               }}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </FormControl>
//           {error && <Alert severity="error">{error}</Alert>}
//           <Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: "#0ab067" }}>Đăng nhập</Button>
//           <Link href="#" variant="body2" align="center">Quên mật khẩu</Link>
//         </Box>
//       </Card>
//     </Stack>
//   );
// }


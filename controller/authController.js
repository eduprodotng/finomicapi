const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const twilioConfig = require("../config/twilio");
const Notifications = require("../mail/notifications");
const { getClientIp } = require("../middlewares/ipgetter");

// const { createWalletForUser } = require("./walletController");

// handles user registration
const registerUser = async (req, res) => {
  try {
    let { phone, email, fullname, password, photourl } = req.body;

    // Convert phone to string safely (in case it comes as number or something else)
    phone = (phone || "").toString().trim();
    email = (email || "").toString().trim().toLowerCase();
    password = (password || "").toString();

    // Basic validation
    if (!email || !phone || !fullname || !password) {
      return res.status(400).json({
        status: "error",
        message:
          "All required fields (email, phone, fullname, password) must be provided and password must be a valid string.",
        data: null,
      });
    }

    // Check if user already exists by email or phone
    const check = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (check) {
      return res.status(400).json({
        status: "error",
        message: "User with same email or phone number already exists.",
        data: null,
      });
    }

    // Create the user with normalized and validated data
    const user = await User.createUser({
      phone,
      email,
      fullname,
      password: password.trim(),
      photourl,
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed.",
      data: error.message || error,
    });
  }
};

const getProfileByUserId = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const data = await User.getProfileByUserId(userId);

    if (data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User profile not found.",
        data: data,
      });
    }

    const {
      id,
      phone,
      email,
      firstname,
      lastname,

      photourl,

      created_at,
      updated_at,
    } = data[0];

    // Map skills to an array

    const userProfile = {
      id,
      phone,
      email,
      firstname,
      lastname,
      photourl,

      created_at,
      updated_at,
    };

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully.",
      data: userProfile,
    });
  } catch (error) {
    console.error("Error in getProfileByUserId:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve profile.",
      error: error.message,
    });
  }
};

// // handles user login
// const login = async (req, res) => {
//   const { email, phone, password } = req.body;
//   let today = new Date().toISOString().slice(0, 10);

//   try {
//     const user = await User.findByEmail(email);

//     if (user != null) {
//       const validPass = await bcrypt.compare(password, user.password);
//       if (!validPass) {
//         return res.status(400).send({
//           status: "error",
//           message: "Invalid password",
//           data: null,
//         });
//       }

//       const accessToken = generateAccessToken({
//         id: user.id,
//         email: user.email,
//         phone: user.phone,
//       });
//       const refreshToken = jwt.sign(
//         {
//           id: user.id,
//           email: user.email,
//           phone: user.phone,
//         },
//         process.env.REFRESH_TOKEN_SECRET
//       );

//       // Store refresh token
//       const storereFreshToken = await User.storeRefreshToken(refreshToken);

//       // Creates Secure Cookie with refresh token
//       res.cookie("jwt", refreshToken, {
//         httpOnly: true,
//         secure: true,
//         sameSite: "None",
//         maxAge: 24 * 60 * 60 * 1000,
//       });

//       const currentDate = new Date().toISOString();

//       res.status(200).send({
//         status: "success",
//         message: "Login was successful",
//         data: { accessToken: accessToken, refreshToken: refreshToken },
//       });
//     } else {
//       const user = await User.findByPhone(phone);

//       if (user != null) {
//         const validPass = await bcrypt.compare(password, user.password);
//         if (!validPass) {
//           return res.status(400).send({
//             status: "error",
//             message: "Invalid password",
//             data: null,
//           });
//         }

//         const accessToken = generateAccessToken({
//           id: user.id,
//           email: user.email,
//           phone: user.phone,
//           lat: user.lat,
//           lon: user.lon,
//           role_id: user.role_id,
//         });
//         const refreshToken = jwt.sign(
//           {
//             id: user.id,
//             email: user.email,
//             phone: user.phone,
//             lat: user.lat,
//             lon: user.lon,
//             role_id: user.role_id,
//           },
//           process.env.REFRESH_TOKEN_SECRET
//         );

//         // Store refresh token
//         const storereFreshToken = await User.storeRefreshToken(refreshToken);

//         // Creates Secure Cookie with refresh token
//         res.cookie("jwt", refreshToken, {
//           httpOnly: true,
//           secure: true,
//           sameSite: "None",
//           maxAge: 24 * 60 * 60 * 1000,
//         });

//         const currentDate = new Date().toISOString();

//         res.status(200).send({
//           status: "success",
//           message: "Login was successful",
//           data: { accessToken: accessToken, refreshToken: refreshToken },
//         });
//       } else {
//         res.status(400).send({
//           status: "error",
//           message: "Email/Phone or password is not correct",
//           data: null,
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Login Error:", error); // <-- Add this
//     res
//       .status(500)
//       .json({ status: "error", message: "Failed to login user.", data: error });
//   }
// };

// const refreshToken = async (req, res) => {
//   const refreshToken = req.body.token;
//   if (refreshToken == null) return res.sendStatus(401);

//   const token = await User.getRefreshToken(refreshToken);
//   if (token && token.length < 0) return res.sendStatus(403);

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
//     if (error) return res.sendStatus(403);
//     const accessToken = generateLongLiveAccessToken({
//       id: user.id,
//       email: user.email,
//       phone: user.phone,
//       lat: user.lat,
//       lon: user.lon,
//       role_id: user.role_id,
//     });

//     res.status(200).send({
//       status: "success",
//       message: "Refresh token retrieved successfully",
//       data: { accessToken: accessToken },
//     });
//   });
// };

const login = async (req, res) => {
  let { email, password } = req.body;

  // Normalize email: trim and lowercase
  email = email?.trim().toLowerCase();

  console.log("Login attempt:", {
    email,
    password: password ? "****" : password,
  });

  try {
    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).send({
        status: "error",
        message: "Email and password are required",
        data: null,
      });
    }

    const user = await User.findByEmail(email);
    console.log(
      "User lookup result:",
      user ? `Found user with email ${email}` : "No user found"
    );

    if (!user) {
      console.log("Login failed: User not found");
      return res.status(400).send({
        status: "error",
        message: "Email or password is not correct",
        data: null,
      });
    }

    const validPass = await bcrypt.compare(password, user.password);
    console.log("Password valid:", validPass);

    if (!validPass) {
      console.log("Login failed: Invalid password");
      return res.status(400).send({
        status: "error",
        message: "Email or password is not correct",
        data: null,
      });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET
    );

    await User.storeRefreshToken(user.id, refreshToken);
    console.log("Stored refresh token for user:", user.id);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("Login successful for user:", user.email);

    res.status(200).send({
      status: "success",
      message: "Login was successful",
      data: { accessToken, refreshToken, user },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to login user.",
      data: error.message || error,
    });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);

  const tokenExists = await User.getRefreshToken(refreshToken);
  if (!tokenExists) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) return res.sendStatus(403);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
    });

    res.status(200).send({
      status: "success",
      message: "Refresh token retrieved successfully",
      data: { accessToken },
    });
  });
};

const refreshTokenWeb = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const token = await User.getRefreshToken(refreshToken);
  if (token && token.length < 0) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) return res.json(error);
    const accessToken = generateLongLiveAccessToken({
      id: user.id,
      email: user.email,
      phone: user.phone,
      lat: user.lat,
      lon: user.lon,
      role_id: user.role_id,
    });

    // Store refresh token
    const storereFreshToken = User.storeRefreshToken(accessToken);

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      status: "success",
      message: "Refresh token retrieved successfully",
      data: { id: user.id, accessToken: accessToken },
    });
  });
};

const changePassword = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { password, newPassword } = req.body;

  if (password != null && newPassword != null) {
    try {
      const user = await User.findById(userId);

      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) {
        return res.status(400).send({
          status: "error",
          message: "Invalid password",
          data: null,
        });
      }

      const hashedPassword = newPassword
        ? await bcrypt.hash(newPassword, 10)
        : null;
      const data = await User.resetPassword(userId, hashedPassword);

      res.status(201).json({
        status: "success",
        message: "Password reset was successful",
        data: data,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Registration failed." });
    }
  } else {
    return res.status(400).send({
      status: "error",
      message: "missing parameters",
      data: null,
    });
  }
};

const sendVerificationCode = async (req, res) => {
  const { phone } = req.body;

  try {
    // Send a verification code
    const verification = await twilioConfig.sendVerificationCode(phone);
    res.status(200).json({
      status: "success",
      message: "Verification code sent.",
      data: verification,
    });
  } catch (error) {
    console.error("Twilio Test Error:", error.message);
    res.status(400).json({
      status: "Twilio error",
      message: "An error occured. Try again",
      data: error.message,
    });
  }
};
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "12h" });
}
const verifyPhone = async (req, res) => {
  const { phone, code } = req.body;

  try {
    const isVerified = await twilioConfig.verifyCode(phone, code);

    res.status(200).json({
      status: "success",
      message: "Verification was successful.",
      data: isVerified,
    });
  } catch (error) {
    console.error("Twilio Test Error:", error.message);
    res.status(400).json({
      status: "Twilio error",
      message: "An error occured. Try again",
      data: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const data = await User.verifyEmail(email, code);
    if (data != null) {
      res.status(200).json({
        status: "success",
        message: "Verification was successfully.",
        data: data,
      });
      //await User.updateVerificationStatus(email, 1);
    } else {
      res
        .status(400)
        .json({ status: "error", message: "Verification failed", data: null });
    }
  } catch (error) {
    console.error("error:", error.message);
    res.status(500).json({
      status: "error",
      message: "An error occured. Try again",
      data: error.message,
    });
  }
};

const resendEmailVerirficationCode = async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000);

  try {
    if (email != null) {
      let user;
      const check = await User.checkVerificationExist(email);
      if (check != null) {
        user = await User.updateVerificationCode(email, code);
      } else {
        user = await User.insertVerificationCode(email, code);
      }

      const data = { recepient_name: "there", code: code };
      await Notifications.whenUserRegister(email, data);

      res.status(200).json({
        status: "success",
        message: "Verification resent successfully.",
        data: user,
      });
    }
  } catch (error) {
    console.error("error:", error.message);
    res.status(500).json({
      status: "error",
      message: "An error occured. Try again",
      data: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findByEmail(email);
    console.log("User found by email:", user);
    if (user == null) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found", data: null });
    }

    const userId = user.id;
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Store token in DB
    await User.storeResetPasswordToken(userId, token);

    // Send Reset Email
    const resetLink = `${process.env.FRONTEND_URL}/reset-psw?token=${token}`;
    const data = {
      recepient_name: user.firstname,
      link: resetLink,
      code: token,
    };
    await Notifications.whenPasswordReset(email, data);

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to your email",
      data: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.userId;

    // Check if token is valid
    const tokenQuery = await User.getPasswordResetTokens(token, userId);
    if (tokenQuery == null) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token",
        data: null,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await User.resetPassword(userId, hashedPassword);

    // Delete the used token
    await User.deletePasswordResetTokens(token);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
      data: [],
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "error",
      message: "Invalid or expired token",
      data: null,
    });
  }
};

module.exports = {
  registerUser,
  login,
  refreshToken,
  refreshTokenWeb,
  resetPassword,
  verifyPhone,
  sendVerificationCode,
  verifyEmail,
  resendEmailVerirficationCode,
  getProfileByUserId,
  forgotPassword,
  changePassword,
};

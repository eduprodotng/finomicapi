const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // googleId: { type: String, default: null },
    googleId: { type: String, default: null, unique: false },
    accessToken: { type: String, default: null },
    photourl: { type: String, default: null },
    refreshToken: { type: String, default: null },
    is_email_verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Static method to check user existence
userSchema.statics.checkUserExist = async function (phone, email) {
  return await this.findOne({
    $or: [{ phone }, { email }],
  });
};
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};
userSchema.statics.storeRefreshToken = async function (userId, token) {
  // You can store the refresh token in the database.
  // Option 1: Add a refreshToken field in the schema (recommended for MongoDB)

  await this.findByIdAndUpdate(userId, {
    $set: { refreshToken: token },
  });
};

//   static async storeResetPasswordToken(userId, token) {
//     const result = await pool.query(
//       "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour') RETURNING token",
//       [userId, token]
//     );
//     return result.rows[0];
//   }

//   static async storeResetPasswordToken(userId, token) {
//     const result = await pool.query(
//       "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour') RETURNING token",
//       [userId, token]
//     );
//     return result.rows[0];
//   }
// userSchema.statics.createUser = async function (data) {
//   const { phone, email, firstname, lastname, password, photourl } = data;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new this({
//     phone,
//     email,
//     firstname,
//     lastname,
//     fullname: `${firstname} ${lastname}`,
//     password: hashedPassword,
//     photourl: photourl || null,
//     is_email_verified: false,
//   });

//   return await newUser.save();
// };

// userSchema.statics.createUser = async function (data) {
//   const { phone, email, fullname, password, photourl } = data;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new this({
//     phone,
//     email,
//     fullname,
//     password: hashedPassword,
//     photourl: photourl || null,
//     is_email_verified: false,
//   });

//   return await newUser.save();
// };

//   static async getProfileByUserId(id) {
//     const result = await pool.query(
//       `
//       SELECT
//           users.id, users.phone, users.email, users.firstname, users.lastname,

//           users.photourl,
//           users.created_at, users.updated_at

//       FROM users

//       WHERE users.id = $1

//       GROUP BY users.id, users.phone, users.email, users.firstname, users.lastname,

//                users.photourl,
//                users.created_at, users.updated_at
//       `,
//       [id]
//     );
//     return result.rows;
//   }
// At the bottom of your schema file, before exporting

userSchema.statics.getProfileByUserId = async function (id) {
  return await this.findById(id).select("-password -__v -refreshToken");
};

userSchema.statics.createUser = async function (data) {
  const { phone, email, fullname, password, photourl } = data;

  // ✅ Validate password before hashing
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string.");
  }

  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const newUser = new this({
    phone,
    email,
    fullname,
    password: hashedPassword,
    photourl: photourl || null,
    is_email_verified: false,
  });

  return await newUser.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;

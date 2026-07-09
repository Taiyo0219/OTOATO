import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: ""
    },
    favoriteGenres: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 8 && value.every((genre) => typeof genre === "string" && genre.length <= 24);
        },
        message: "favoriteGenresは8個以内、各24文字以内で指定してください。"
      }
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "" },
    artworkUrl: { type: String, default: "" },
    previewUrl: { type: String, default: "" },
    externalUrl: { type: String, default: "" }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    track: {
      type: trackSchema,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    visibility: {
      type: String,
      enum: ["private", "friends", "public"],
      default: "public"
    },
    comment: {
      type: String,
      maxlength: 80,
      default: ""
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

postSchema.index({ location: "2dsphere" });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    topPosts: [
      {
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        views: Number,
        likes: Number,
      },
    ],
    deviceBreakdown: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
    },
    trafficSources: {
      direct: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

analyticsSchema.index({ date: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;

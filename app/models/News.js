import mongoose from "mongoose"

const accessSchema = new mongoose.Schema({
  id: String,
  timestamp: {
    type: Date,
    required: true,
  },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmChannel: String,
})

const newsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accesses: [accessSchema],
    lastAccess: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      index: true,
    },
    totalAccesses: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

newsSchema.index({ createdAt: -1 })
newsSchema.index({ lastAccess: -1 })
newsSchema.index({ totalAccesses: -1 })
newsSchema.index({ "accesses.timestamp": -1 })
newsSchema.index({
  "accesses.utmSource": 1,
  "accesses.utmMedium": 1,
  "accesses.utmCampaign": 1,
})

mongoose.connection.on("connected", async () => {
  try {
    const collection = mongoose.connection.collection("news")
    await collection.dropIndex("id_1")
  } catch (error) {
    console.log("Índice não encontrado ou já removido")
  }
})

export default mongoose.models.News || mongoose.model("News", newsSchema)

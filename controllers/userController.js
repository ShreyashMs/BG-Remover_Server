import { Webhook } from "svix";
import userModel from "../models/userModel.js";

// Manage clerk user
const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOKS_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        return res.status(201).json({});
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        const updatedUser = await userModel.findOneAndUpdate(
          { clerkId: data.id },
          userData,
          { new: true }
        );
        if (!updatedUser) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
        return res.json({});
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        return res.json({});
      }
      default:
        return res
          .status(400)
          .json({ success: false, message: "Unknown event type" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };

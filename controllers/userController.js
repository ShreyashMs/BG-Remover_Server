import { Webhook } from "svix";
import userModel from "../models/userModel.js";

// Manage clerk user
const clerkWebhooks = async (req, res) => {
  console.log("Received webhook:", req.body);
  console.log("Headers:", req.headers);

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
         
        };
        const newUser = await userModel.create(userData);
        console.log("User created:", newUser);
        return res.status(201).json({ success: true });
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
          return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log("User updated:", updatedUser);
        return res.json({ success: true });
      }
      case "user.deleted": {
        const deletedUser = await userModel.findOneAndDelete({ clerkId: data.id });
        if (!deletedUser) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        console.log("User deleted:", deletedUser);
        return res.json({ success: true });
      }
      default:
        return res.status(400).json({ success: false, message: "Unknown event type" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error); 
    return res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };

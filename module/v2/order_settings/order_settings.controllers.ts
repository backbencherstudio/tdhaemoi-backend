

export const manageOrderSettings = async (req, res) => {
    try {
        const partnerId = req.user.id;

    } catch (error) {
        console.error("Error in manageOrderSettings:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error?.message || "Unknown error",
        });
    }
}
const ProfileViewCount = require('../model/ProfileViewCount');

const store = async (req, res) => {
    try {
        const { profile_id, viewer_id } = req.fields;

        const now = new Date();
        const MIN_VIEW_INTERVAL_MINUTES = 30;

        const profileViewDetails = await ProfileViewCount.findOne({ profile_id, viewer_id });

        if (profileViewDetails) {
            const lastViewed = profileViewDetails.last_viewed_at || profileViewDetails.createdAt;
            const timeDiff = (now - new Date(lastViewed)) / (1000 * 60);

            if (timeDiff < MIN_VIEW_INTERVAL_MINUTES) {
                return res.status(200).json({ message: "You already visited recently, not counted." });
            }

            await ProfileViewCount.findByIdAndUpdate(profileViewDetails.id, {
                viewCount: profileViewDetails.viewCount + 1,
                last_viewed_at: now,
            });

            return res.status(200).json({ message: "View count updated after time interval." });
        } else {
            const newViewer = new ProfileViewCount({
                profile_id,
                viewer_id,
                viewCount: 1,
                created_by: viewer_id,
                last_viewed_at: now,
            });
            await newViewer.save();

            return res.status(200).json({ message: "New viewer registered." });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const getViewerCount = async (req, res) => {
    const { profile_id } = req.params;
    const ViewersCount = await ProfileViewCount.countDocuments({ profile_id: profile_id });
    return res.status(200).json({ viewCount: ViewersCount });
}

module.exports = { store, getViewerCount };
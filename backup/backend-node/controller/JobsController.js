const Jobs = require('../model/Jobs');

const list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const role = req.query.role;
    const user_id = req.query.user_id;

    const searchCondition = {
        status: 1,
        trash: "NO",
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { location: { $regex: searchQuery, $options: 'i' } },
            { salary: { $regex: searchQuery, $options: 'i' } },
            { category_id: { $regex: searchQuery, $options: 'i' } },
            { job_type: { $regex: searchQuery, $options: 'i' } },
        ],
    };

    if (role == 1) {
        searchCondition.is_approved = 2;
        searchCondition.is_closed = 0;
    }
    if (role == 3) {
        searchCondition.created_by = user_id;
    }

    const jobDetails = await Jobs.find(searchCondition).sort({ timestamp: 1 }).skip(skip).limit(limit);
    const total = await Jobs.countDocuments(searchCondition);

    res.json({
        data: jobDetails,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalRecords: total,
    })
}

const store = async (req, res) => {
    const { comp_id, title, description, category_id, location, salary, job_type, created_by } = req.fields;

    try {
        const newJob = new Jobs({ comp_id: comp_id, title: title, description: description, category_id: category_id, location: location, salary: salary, job_type: job_type, is_approved: 1, created_by: created_by });

        await newJob.save();

        return res.status(200).json({ data: newJob });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

const view = async (req, res) => {
    try {
        const JobDetails = await Jobs.findOne({ _id: req.params.id });
        return res.status(200).json({ data: JobDetails });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

const approve = async (req, res) => {
    try {
        const { action } = req.fields;

        let status = 1;
        if (action == 1) {
            status = 2;
        } else {
            status = 3;
        }

        const JobDetails = await Jobs.findByIdAndUpdate(
            req.params.id,
            { is_approved: status },
            { new: true }
        );

        return res.status(200).json({ message: action, data: JobDetails });

    } catch (err) {
        return res.status(500).json({ message: err.message || "Server Error" });
    }
};

const CloseOpenJob = async (req, res) => {
    try {
        const { job_id } = req.fields;

        const jobDetails = await Jobs.findById(job_id);
        if (!jobDetails) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Toggle status
        let closeStatus;
        let action;
        if (jobDetails.is_closed === 0) {
            closeStatus = 1;
            action = "Job Closed Successfully";
        } else {
            closeStatus = 0;
            action = "Job Opened Successfully";
        }

        // Update and return new job object
        const updatedJob = await Jobs.findByIdAndUpdate(
            job_id,
            { is_closed: closeStatus },
            { new: true }
        );

        return res.status(200).json({ message: action, data: updatedJob });
    } catch (err) {
        return res.status(500).json({ message: err.message || "Server Error" });
    }
};


module.exports = { store, view, approve, list, CloseOpenJob };
const Company = require("../model/Company");
const { param } = require("../routes/CompanyRoutes");

const list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    const searchCondition = {
        status: 1,
        trash: "NO",
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
        ]
    };

    const CompanyList = await Company.find(searchCondition).skip(skip).limit(limit);
    const total = await Company.countDocuments(searchCondition);

    res.json({
        data: CompanyList,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalRecords: total,
    })

}

const store = async (req, res) => {
    const { comp_name, comp_email, comp_ph, comp_reg_no, comp_address } = req.fields;

    // Check for unique fields
    const existingEmail = await Company.findOne({ comp_email });
    if (existingEmail) {
        return res.status(400).json({ field: 'comp_email', message: 'Email already exists!' });
    }

    const existingPhone = await Company.findOne({ comp_ph });
    if (existingPhone) {
        return res.status(400).json({ field: 'comp_ph', message: 'Phone number already exists!' });
    }

    const regNoExist = await Company.findOne({ comp_reg_no });

    if (regNoExist) {
        return res.status(400).json({ message: "Register Number already Exist !" });
    }

    const newComapny = new Company({ comp_name, comp_email, comp_ph, comp_reg_no, comp_address });

    await newComapny.save();

    return res.status(200).json({ data: newComapny });
}

const update = async (req, res) => {
    try {
        const { comp_name, comp_email, comp_ph, comp_reg_no, comp_address } = req.fields;

        const Company_details = await Company.findOneAndUpdate(
            { _id: req.params.id },
            {
                comp_name: comp_name,
                comp_email: comp_email,
                comp_ph: comp_ph,
                comp_reg_no: comp_reg_no,
                comp_address: comp_address,
            },
            { new: true }
        );
        return res.status(200).json({ data: Company_details });

    } catch (err) {
        console.error("Updaet error:", err);
        res.status(500).json({ message: "Failed to update company", err });
    }
}

const unique = async (req, res) => {
    try {
        const company = await Company.findOne({ comp_reg_no: req.fields.comp_reg_no, status: 1, trash: "NO" });
        res.json({ existValue: !!company });
    } catch (err) {
        return res.status(500).json({ message: err })
    }
}

const emailUnique = async (req, res) => {
    try {
        const company = await Company.findOne({ comp_email: req.fields.comp_email, status: 1, trash: "NO" });
        res.json({ data: { existValue: !!company } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const phUnique = async (req, res) => {
    try {
        const company = await Company.findOne({ comp_ph: req.fields.comp_ph, status: 1, trash: "NO" });
        res.json({ data: { existValue: !!company } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { list, store, update, unique, emailUnique, phUnique };
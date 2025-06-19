"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionsFlow = void 0;
const question_data_1 = require("./question.data");
function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "_").trim();
}
const getQuestionsFlow = (req, res) => {
    const { categoryTitle, subCategoryTitle } = req.params;
    if (!categoryTitle) {
        const categories = question_data_1.questionnaireData.map(cat => ({
            title: cat.title,
            slug: normalize(cat.title),
            image: cat.image
        }));
        return res.json({ level: "category", data: categories });
    }
    const category = question_data_1.questionnaireData.find(c => normalize(c.title) === normalize(categoryTitle));
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    if (Array.isArray(category.data) && category.data.length > 0) {
        if (subCategoryTitle) {
            const subCategory = category.data.find(sub => normalize(sub.title) === normalize(subCategoryTitle));
            if (!subCategory) {
                return res.status(404).json({ message: "Sub-category not found" });
            }
            return res.json({
                level: "questions",
                category: category.title,
                subCategory: subCategory.title,
                questions: (subCategory.questions || []).map(q => ({
                    question: q.question,
                    question_key: normalize(q.question),
                    options: q.options
                }))
            });
        }
        const subCategories = category.data.map(sub => ({
            title: sub.title,
            slug: normalize(sub.title),
            image: sub.image
        }));
        return res.json({
            level: "sub-categories",
            category: category.title,
            data: subCategories
        });
    }
    if (category.questions && Array.isArray(category.questions)) {
        return res.json({
            level: "questions",
            category: category.title,
            questions: category.questions.map(q => ({
                question: q.question,
                question_key: normalize(q.question),
                options: q.options
            }))
        });
    }
    return res.json({ level: "category", category: category.title, data: [] });
};
exports.getQuestionsFlow = getQuestionsFlow;
//# sourceMappingURL=question.controllers.js.map
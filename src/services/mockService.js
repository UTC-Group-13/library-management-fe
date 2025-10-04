let db = {
    books: [
        { id: 1, code: "B001", name: "Clean Code", author: "Robert Martin", category: "Programming" },
    ],
    authors: [
        { id: 1, code: "A001", name: "Robert Martin", country: "USA" },
    ],
    students: [
        { id: 1, code: "SV001", name: "Nguyen Van A", faculty: "CNTT", class: "K17", status: "Đang học" },
    ],
    categories: [
        { id: 1, code: "C001", name: "Programming" },
    ],
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockService = {
    async getAll(type) {
        await wait(200);
        return db[type] || [];
    },
    async create(type, data) {
        await wait(200);
        const newItem = { ...data, id: Date.now() };
        db[type].push(newItem);
        return newItem;
    },
    async update(type, id, data) {
        await wait(200);
        db[type] = db[type].map((x) => (x.id === id ? { ...x, ...data } : x));
    },
    async remove(type, id) {
        await wait(200);
        db[type] = db[type].filter((x) => x.id !== id);
    },
};

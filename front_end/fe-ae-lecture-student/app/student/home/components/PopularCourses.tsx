"use client";

const courses = [
    {
        title: "Digital Marketing Masterclass",
        instructor: "Sarah Johnson",
        img: "/course1.jpg",
        students: 1200,
    },
    {
        title: "Data Analytics with Python",
        instructor: "Michael Brown",
        img: "/course2.jpg",
        students: 900,
    },
    {
        title: "UX/UI Design for Beginners",
        instructor: "Anna Lee",
        img: "/course3.jpg",
        students: 750,
    },
];

export default function PopularCourses() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-slate-800">
                    Popular Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {courses.map((c, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border overflow-hidden shadow-md hover:shadow-xl transition bg-white"
                        >
                            <img src={c.img} alt={c.title} className="w-full h-52 object-cover" />
                            <div className="p-6 text-left">
                                <h3 className="font-semibold text-lg mb-2 text-slate-900">{c.title}</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    By {c.instructor}
                                </p>
                                <div className="text-violet-600 font-medium">
                                    {c.students.toLocaleString()} Students
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

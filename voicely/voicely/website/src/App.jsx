import React from "react";
import {
    Navbar,
    Hero,
    Companies,
    Courses,
    Achievement,
    Categories,
    Feedback,
    CTA,
    Footer,
} from "./components";
import "./App.css";

export const App = () => {
    return (
        <div>
            <div>
                <Navbar />
                <Hero />
                <Companies />
                <Courses />
                <Achievement />
                <Categories />
                <Feedback />
                <CTA />
                <Footer />
            </div>
        </div>
    );
};

export default App;

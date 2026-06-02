const express = require("express");
const router = express.Router();
const { supabase } = require("../memory/supabase");

// ==========================================
// 1. REGISTRATION ENDPOINT
// ==========================================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        // ✅ FIXED: Handle Supabase's Email Enumeration Protection
        // If there's no error but user is null, the email is already registered.
        if (!data || !data.user) {
            return res.status(400).json({ 
                message: "An account with this email already exists. Please log in instead." 
            });
        }

        res.status(201).json({
            id: data.user.id,
            name: name,
            email: email,
            isPremium: false,
            token: data.session ? data.session.access_token : "verify_email"
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal server error during registration." });
    }
});

// ==========================================
// 2. LOGIN ENDPOINT
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password." });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ message: error.message });
        }

        res.status(200).json({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || "Indra User",
            email: email,
            isPremium: false,
            token: data.session.access_token
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error during login." });
    }
});

module.exports = router;
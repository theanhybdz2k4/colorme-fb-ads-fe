import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lncgmaxtqjfbcypncfoe.supabase.co";
// Chỗ này mình cần Lấy Key trong Dashboard, nhưng vì không có sẵn ở Frontend ENV nên em sẽ dùng cách lấy token login từ LocalStorage nếu có, hoặc tạo Node JS query đơn giản

async function run() {
    try {
        console.log("Mocking Authentication Call to:", `${SUPABASE_URL}/functions/v1/ads-analytics-report/report/campaign/bf4a1964-8c1c-4e8b-8a2b-97e45fcad887`);

        // Cần truyền master key vì Node runtime ko có trình duyệt
        const MASTER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.MASTER_KEY || process.argv[2];

        if (!MASTER_KEY) {
            console.error("Please provide MASTER_KEY as argument: node test_report.js <YOUR_KEY>");
            return;
        }

        const res = await fetch(`${SUPABASE_URL}/functions/v1/ads-analytics-report/report/campaign/bf4a1964-8c1c-4e8b-8a2b-97e45fcad887`, {
            headers: {
                "Authorization": `Bearer ${MASTER_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data keys:", Object.keys(data));

        if (data.success && data.data && data.data.raw_response) {
            console.log("--- AI REPORT PREVIEW ---");
            console.log(data.data.raw_response.substring(0, 500) + "...\n-------------------------");
        } else {
            console.log("Error or Missing Data:", data);
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}

run();

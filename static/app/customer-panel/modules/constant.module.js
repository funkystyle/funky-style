angular.module("constantModule", [])
    .constant("mainURL", "")
    .constant('URL', {
        login: "/api/1.0/auth/login",
        register: "/api/1.0/auth/signup",
        logout: "/api/1.0/auth/logout",
        currentUser: "/api/1.0/auth/me",
        sendForgetPasswordLink: "api/1.0/auth/send-forgot-password-link",
        changePassword: "/api/1.0/auth/change-password",
        emailActivation: "/api/1.0/auth/email-activation",
        me: "/api/1.0/auth/me",
        persons: "/api/1.0/persons?rand_number="+Math.random(),
        deleteDocuments: '/api/1.0/delete-documents',
        deals: "/api/1.0/deals",
        categories: '/api/1.0/categories?embedded={"related_categories":1, "top_categories":1, "top_stores":1}&rand_number='+Math.random(),
        coupons: '/api/1.0/coupons?embedded={"recommended_stores":1, "related_categories":1, "related_stores":1}&rand_number='+Math.random(),
        stores: '/api/1.0/stores?embedded={"recommended_stores":1, "related_categories":1, "related_stores":1}&rand_number='+Math.random(),
        cms_pages: "/api/1.0/cms_pages",
        deal_brands: "/api/1.0//deal_brands",
        deal_categories: "/api/1.0//deal_categories",
        banner: "/api/1.0//banner",
        master_seo: "/api/1.0/master_seo",
        coupons_comments: "/api/1.0/coupons_comments",
        coupons_reports: "/api/1.0/coupons_reports",
        blog: "/api/1.0/blog"
    });
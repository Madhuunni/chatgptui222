package com.example.filters;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class CorsFilter implements Filter {

    private static final String ALLOWED_ORIGIN =
            "http://localhost:4200";

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");

        res.addHeader("Vary", "Origin");

        if (ALLOWED_ORIGIN.equals(origin)) {
            res.setHeader(
                    "Access-Control-Allow-Origin",
                    ALLOWED_ORIGIN
            );
            res.setHeader(
                    "Access-Control-Allow-Methods",
                    "POST, OPTIONS"
            );
            res.setHeader(
                    "Access-Control-Allow-Headers",
                    "Content-Type, Authorization"
            );
        }

        boolean preflight =
                "OPTIONS".equalsIgnoreCase(req.getMethod())
                && origin != null
                && req.getHeader("Access-Control-Request-Method") != null;

        if (preflight) {
            if (!ALLOWED_ORIGIN.equals(origin)
                    || !"POST".equalsIgnoreCase(
                        req.getHeader("Access-Control-Request-Method"))) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            res.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        // The actual POST continues to your existing servlet.
        chain.doFilter(request, response);
    }
}

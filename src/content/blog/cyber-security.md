---
title: Cyber Security
slug: cyber-security
description: Foundational security principles for software systems, including authentication, authorization, encryption, and threat modeling.
tags: [Security, Cyber Security, Best Practices]
date: 2024-04-01
readTime: 10
author:
  name: Maath Mphepo
  avatar: /images/hero-profile.png
  bio: Backend Developer specializing in Django and Laravel
---

# Cyber Security

Security is not a feature you add at the end. It is a property of how the system is designed, built, and operated. This note covers the fundamentals.

## The CIA Triad

Confidentiality, Integrity, Availability. Every security decision should be evaluated against these three goals.

- **Confidentiality**: Data is accessible only to authorized parties
- **Integrity**: Data cannot be altered without detection
- **Availability**: The system is operational when needed

## Authentication and Authorization

Authentication proves who you are. Authorization determines what you are allowed to do.

- Use strong, modern password hashing (Argon2, bcrypt, scrypt)
- Implement multi-factor authentication where appropriate
- Use short-lived access tokens with refresh tokens
- Follow least privilege: grant only the permissions needed

## Encryption

- Encrypt data in transit using TLS 1.2 or higher
- Encrypt sensitive data at rest
- Never roll your own cryptography. Use battle-tested libraries
- Manage keys carefully. Key management is often harder than the crypto itself

## Input Validation

Treat all input as untrusted. Validate on the server, never rely on client-side validation alone.

- Use allowlists, not blocklists
- Parameterize database queries to prevent injection
- Encode output to prevent cross-site scripting (XSS)

## Threat Modeling

Before building, identify:

- What assets need protection?
- Who are the potential threat actors?
- What could go wrong?
- How will you detect and respond?

Document threats and mitigations. Revisit the model as the system evolves.

## Security Is Operational

- Keep dependencies updated
- Monitor for suspicious activity
- Have an incident response plan
- Rotate credentials regularly

Security is a process, not a product.
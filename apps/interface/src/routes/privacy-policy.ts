import '@/components/ui/markdown'
import { css, CSSResultGroup, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

export const content = `

# Privacy Policy for Aura Verified

## Introduction
Aura Verified ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.

## Information We Collect
- **Email Address**: When you sign up or log in using your email, Google, or Apple ID, we collect your email address.

## How We Use Your Information
- **Identity Creation**: The hashed email is used to create a unique identifier for your Aura profile.
- **Verification Process**: We use verification data from relatives or other Aura players to assess and assign a verification score and level.
- **Service Improvement**: We may analyze aggregated and anonymized data to improve our services and user experience.

## Data Storage and Security
- **No Database Storage**: We do not store your email address or any personally identifiable information in a database.
- **Hashed Identifiers**: Your email is hashed using secure cryptographic methods to create a non-reversible identifier.
- **Security Measures**: We implement industry-standard security practices to protect verification data and ensure the integrity of our services.

## Data Sharing
- We do not share, sell, or disclose your personal information to third parties, except as required by law or to protect our rights and services.
- Verification data provided by relatives or Aura players is used solely for assessing your identity within the Aura platform.

## User Choices
- **Login Options**: You may choose to log in with your email, Google, or Apple ID. No additional verification is required for login.
- **Opt-Out**: You can stop using our services at any time. Since we do not store personal data, no further action is needed to delete your information.

## Cookies and Tracking
- We do not use cookies or tracking technologies for data collection or analytics.

## Third-Party Services
- **Google and Apple Login**: When you log in using Google or Apple ID, their respective privacy policies apply to the handling of your credentials.
- We do not access or store any additional data from these third-party services beyond what is necessary for authentication.

## Changes to This Privacy Policy
We may update this Privacy Policy to reflect changes in our practices or legal requirements. The updated policy will be posted on our website with the effective date.

## Contact Us
If you have questions about this Privacy Policy, contact us at [Discord Channel](https://discord.gg/pcWy6NqM).


`

@customElement('privacy-policy')
export class PrivacyPolicyElement extends LitElement {
  static styles?: CSSResultGroup | undefined = css`
    c-markdown {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .container {
      text-align: left;
    }

    a {
      text-decoration: none;
      color: #bfb3f8;
      font-weight: bold;
    }
  `
  protected render() {
    return html`
      <div class="container">
        <a href="/">Back</a>

        <c-markdown markdown="${content}"></c-markdown>
      </div>
    `
  }
}

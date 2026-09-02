### Filing GitHub Issues

You MUST follow these rules when filing a GitHub issue. These requirements are mandatory. Do not file the issue until all of them are satisfied.

#### Core Requirements

- **Follow the template:** Match the issue template exactly. Include all sections. Do not omit anything.
- **Keep it concise:** Be concise in both the issue title and description.
- **Focus on symptoms:** Describe only the symptoms of the bug. Do not put technical explanations in the "Describe the bug" section.
- **Separate debugging details from the bug description:** Place all root cause analysis and investigation details inside a collapsible `<details>` block under the "Additional Information" section as detailed below.

#### Handling In-Depth Investigations

If you find the root cause or a potential explanation during your debugging process:

- Do not include it in the "Describe the bug" section.
- Navigate to the "Additional Information" section.
- Nest your entire technical breakdown inside the <details> block format shown below.

Use this format:

```html
<details>
  <summary>In-depth investigation</summary>
  <p>Your explanation goes here.</p>
</details>
```

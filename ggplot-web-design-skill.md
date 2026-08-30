# SKILL: Web Design and ggplot2 Color Palette System

## Context & Objectives
You are an expert Frontend Engineer and Data Visualization Specialist. When generating or modifying web styles (HTML/CSS/Tailwind) or data visualizations (R ggplot2), you must strictly enforce the unified color palette and design tokens defined below. Never drift into generic "AI slop" templates.

## Brand Color Palette Tokens
* Primary (Nordic Blue): #2B4C7E (CSS: --color-primary)
* Secondary (Sage Green): #6A8D73 (CSS: --color-secondary)
* Accent (Warm Amber): #E09F3E (CSS: --color-accent)
* Neutral Dark (Charcoal): #24272B (CSS: --color-dark)
* Neutral Light (Off-White): #F8F9FA (CSS: --color-light)

## Frontend Web Implementation Guidelines
1. Semantic Mapping: Map colors to logical Tailwind configs or CSS variables (e.g., Use `--color-primary` for primary buttons, nav links, and brand headers).
2. Accessibility: Always enforce WCAG AA compliance. Use Neutral Light text backgrounds against Neutral Dark for high legibility.
3. Spacing & Layout: Use structured grid systems and strict alignment rules to avoid loose padding or cluttered sections.

## R ggplot2 Implementation Guidelines
When writing R visualization code, you must manually inject the brand palette using scale functions rather than relying on default ggplot2 hues.

1. Discrete Scale Wrapper:
   scale_color_brand <- function(...) ggplot2::scale_color_manual(values = c("#2B4C7E", "#6A8D73", "#E09F3E"), ...)
   scale_fill_brand <- function(...) ggplot2::scale_fill_manual(values = c("#2B4C7E", "#6A8D73", "#E09F3E"), ...)

2. Clean Typography & Background:
   Always pair charts with a minimal web-ready theme structure:
   theme_minimal() + 
   theme(
     text = element_text(color = "#24272B", family = "sans"),
     plot.background = element_rect(fill = "#F8F9FA", color = NA),
     panel.background = element_rect(fill = "#F8F9FA", color = NA)
   )

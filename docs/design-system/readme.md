---
title: Epochtalk Design System
---

<a name="top"></a>

# Epochtalk Design System
The Epochtalk Design System provides a set of product design principles and guidelines that help build a cohesive user experience. 

We are starting the system with documentation and guidelines for all interface elements in the new Epochtalk experience. Future iterations of the system will include working code and design resources.

# Core
The smallest components of the design system

## Colors
Colors were chosen to emphasize actionable elements, while allowing the forum content to remain highly visible–since text and images are the most important elements on a discussion forum. 

The initial color theme for Epochtalk was chosen for maximum legibility. The white background with dark gray text allows for best readability. Orange is used at the primary highlight color to allow high visibility (contrast with the background and body text) without being obtrusive.

Several shades of the body color (gray) are used to de-emphasize secondary content, as well as to delineate elements (sections, panels, cards, etc).

| Color | Value | Variable |
| :---- | :---- | :------- |
| Background color: |	#FFFFFF	|	$color-bg |
| Background highlight color: |	#F5F5F5	|	$color-bg--highlight |
| Shadow color: |	4px 16px 8px rgba(0, 0, 0, 0.1)	| $color-shadow |
| Body color:	|	rgb(34, 34, 54)	|	$color-body |
| Secondary font color: |	rgb(153, 153, 153) | $color-body--secondary |
| Primary color: | rgb(255, 200, 0) | $color-primary |
| Secondary color: |  |  |
| Alert color: | rgb(202, 0, 0)	| $color-alert |
| Warning color: | rgb(255, 100, 0)	| $color-warning |


## Type
Epochtalk now uses Roboto as the primary font. Roboto was chosen for increased legibility and information density. Roboto is a modern, humanist sans serif font designed specifically for legibility on mobile screens. We can maintain high information density by tightening the line-height of the content, and using smaller font sizes while also keeping legibility high.

Roboto is used for all body text, highlight text and headers.

Font families
* Body: **Roboto (show example)**

### Font Sizes
Font sizes were chosen to maintain legibility of the main content (post body), allow differentiation between header / heading text, and allow de-emphasis of secondary text.

| Name | Size |
| :--- | :--- |
| Base / Body font size: | 16px |
| Heading 1: | 44px (2.75rem) |
| Heading 2: | 37px (2.3125rem) |
| Heading 3: | 24px (1.5rem) |
| Heading 4: | 21px (1.3125rem) |
| Heading 5: | -- |
| Small text:	| 14px (0.875rem) |
| Extra small / caption text: | 12px (0.75rem) |

### Line Height
Line height has been selected for increased information density. We selected this value to maintain legibility while allowing more text to be displayed in a given space. 

**Base line-height: 1.3**


### Formatted Text
#### Quotes
(insert image)
Quoted text is indented from the starting edge of the content (left edge on left-to-right languages). The indented text block has a light-gray line along its left edge to help differentiate it from body text. Quoted text is also shown in the secondary font color.

#### Code
(insert image)
`Code blocks` are shown in a block separated from the body text. The code block uses a light gray background and is rendered in the Consolas monospaced font. Code blocks appear in a single line. If the code exceeds the width of the post area, the block can be scrolled horizontally.


## Icons
Icons are used to help users complete their tasks. They help users identify available actions or the current states of an element .

Icon forms should be simple and easy to understand. Avoid abstract icons. Avoid using ambiguous (or counterintuitive) icons. For clarity, icons should be paired with text whenever possible.

### Icon sizes
The base icon size is 16px (equivalent to the body font size). Icons should be sized according to the text they accompany–icons shown alongside smaller text labels should be downsized to match the text.

Icons can be used in larger sizes when an action or state requires more emphasis.

Icons are transitioning from a custom icon font to SVG. The SVG icons are more flexible, maintainable and faster  than the icon font (learn more about SVG icons). 

Icons:
(insert icons here)

## Images
Images uploaded to Epochtalk are displayed at the full width of the image’s container–on mobile, the container is usually the full-width of the browser, so the image appears full-width. On tablets and desktop browsers, the container is usually one column in a 2-column layout, so the images are displayed to the full width of the column.

## Video
Like images, videos are displayed at the full width of their container. Video from services such as YouTube are embedded within the forum content.


# Fundamentals
Collections of Atoms that create bigger components

## Links
* Primary style
* Secondary
* Hover
* Disabled

## Buttons
Buttons are used to initiate actions. Buttons should clearly indicate the action that occurs when the user clicks them. Labels and icons should be used to communicate the button’s intended action. 

Text-only buttons are used most often since they clearly communicate their action. Icons can be added to text labels to improve recognition of buttons. See #icons for more information on the use of icons.

Icon-only buttons can be used when space is constrained and buttons with labels are not feasible.

### Buttons variations:
* Label only
* Icon + label
* Icon only
* Primary style
* Secondary
* Slim
* Hover
* Disabled


## Tabs
* Normal state
* Active state
* Dark
* Hover

## Badges
Badges are small text-based labels used to show states, status and roles. Examples of badges include:

“Locked” and “Sticky” badges shown on a Thread
“Superadministrator” badge shown on users with advanced roles

## Avatars and User Details
Avatars display a user’s chosen profile image. A default avatar is shown if the user has not uploaded their own image. 

Avatars are often accompanied by the user’s information. Examples include:

* Online status
* User name
* User role
* User status
* Last login date

## Forms
Forms allow users to enter and manipulate data. Forms can include:

### Labels
Labels help users identify fields. Labels can appear in various positions in their fields (inside the field outline, above the field, etc)..

### Text fields
Text fields allow users to enter short text (as opposed to multi-line text fields which allow for long-form text entry).

Text field labels will appear inside the field’s outline. 


### Text field variations
#### Plain text field (no label)
![test images](./img/field/text/empty@2x.png)

This type of field is only used when a section header or other text functions as a label for a single field, so an embedded label is not necessary.

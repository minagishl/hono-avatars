# Hono Avatars

This repository contains code that uses the REST API to generate avatars and return them as images.

## Usage

All requests return an image stream to be used directly in an `<img/>` tag.

Generate an avatar with default settings, for user "John Doe":

    https://hono-avatars.pages.dev/?name=john+doe

Generate a blue avatar:

    https://hono-avatars.pages.dev/?background=0D8ABC&color=fff

## Parameters

> Note: This project is compatible with `ui-avatars.com`, some parameters are not supported but should work the same.

  * `name` - The name of the user to generate the avatar.
  * `background` - The background color of the avatar. Default is `#DDDDDD`.
  * `color` - The text color of the avatar. Default is `#222222`.
  * `size` - The size of the avatar. Default is `64`.
  * `font-size` - The font size of the text. Default is `0.5`.
  * `length` - The length of the text. Default is `2`.
  * `rounded` - The border radius of the avatar. Default is `false`.
  * `bold` - The font weight of the text. Default is `false`.
  * `uppercase` - The text transform of the text. Default is `true`.
  * `format` - The format of the image. Default is `png`.
  * `font-family` - The font family of the text. Default is `sans`.
  * `shadow` - The text shadow of the text. Default is `false`.
  * `border` - The border of the avatar. Default is `false`.
  * `opacity` - The opacity of the avatar. Default is `1`.

## Detailed Parameters Usage

<details>
  <summary>Click to expand!</summary>

  ### name
  - **Description**: The name of the user to generate the avatar.
  - **Default**: `John Doe`
  - **Example**: `name=John+Doe`
  
  ### background
  - **Description**: The background color of the avatar.
  - **Default**: `#DDDDDD`
  - **Example**: `background=0D8ABC`

  ### color
  - **Description**: The text color of the avatar.
  - **Default**: `#222222`
  - **Example**: `color=fff`

  ### size
  - **Description**: The size of the avatar.
  - **Default**: `64`
  - **Example**: `size=128`

  ### font-size
  - **Description**: The font size of the text.
  - **Default**: `0.5`
  - **Example**: `font-size=0.7`

  ### length
  - **Description**: The length of the text.
  - **Default**: `2`
  - **Example**: `length=1`

  ### rounded
  - **Description**: The border radius of the avatar.
  - **Default**: `false`
  - **Example**: `rounded=true`

  ### bold
  - **Description**: The font weight of the text.
  - **Default**: `false`
  - **Example**: `bold=true`

  ### uppercase
  - **Description**: The text transform of the text.
  - **Default**: `true`
  - **Example**: `uppercase=false`

  ### format
  - **Description**: The format of the image.
  - **Default**: `png`
  - **Example**: `format=svg`

  ### font-family
  - **Description**: The font family of the text.
  - **Default**: `sans`
  - **Example**: `font-family=serif`

  ### shadow
  - **Description**: The text shadow of the text.
  - **Default**: `false`
  - **Example**: `shadow=true`

  ### border
  - **Description**: The border of the avatar.
  - **Default**: `false`
  - **Example**: `border=true`

  ### opacity
  - **Description**: The opacity of the avatar.
  - **Default**: `1`
  - **Example**: `opacity=0.5`

</details>

## License

MIT license

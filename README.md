# Hono Avatars

This repository contains code that uses the REST API to generate avatars and return them as images.

## Usage

All requests return an image stream to be used directly in an `<img/>` tag.

**Generate an avatar with default settings, for user "John Doe":**

```
https://hono-avatars.pages.dev/?name=john+doe
```

**Generate a blue avatar:**

```
https://hono-avatars.pages.dev/?background=0D8ABC&color=fff
```

## Parameters

> **Note:** This project is compatible with `ui-avatars.com`, some parameters are not supported but should work the same.

- `name` - The name of the user to generate the avatar.
- `background` - The background color of the avatar. Default is `#DDDDDD`.
- `color` - The text color of the avatar. Default is `#222222`.
- `size` - The size of the avatar. Default is `64`.
- `blur` - The blur of the avatar. Default is `0`.
- `font-size` - The font size of the text. Default is `0.5`.
- `font-family` - The font family of the text. Default is `sans`.
- `length` - The length of the text. Default is `2`.
- `rounded` - The border radius of the avatar. Default is `false`.
- `bold` - The font weight of the text. Default is `false`.
- `uppercase` - The text transform of the text. Default is `true`.
- `format` - The format of the image. Default is `png`.
- `rotate` - The rotation of the text. Default is `0`.
- `shadow` - The text shadow of the text. Default is `false`.
- `border` - The border of the avatar. Default is `false`.
- `border-style` - The border style of the avatar. Default is `solid`.
- `border-width` - The border width of the avatar. Default is `0.5`.
- `opacity` - The opacity of the avatar. Default is `1`.
- `reverse` - The reverse of the text. Default is `false`.
- `oblique` - The font style of the text. Default is `false`.

## Detailed Parameters Usage

<details>
  <summary>Click to expand!</summary>

### name

- **Description**: The name of the user to generate the avatar.
- **Default**: None
- **Example**: `name=John+Doe`
- **Values**: Any string value (max 40 characters)

### background

- **Description**: The background color of the avatar.
- **Default**: `#DDDDDD`
- **Example**: `background=0D8ABC`
- **Values**: Any valid hex color code

### color

- **Description**: The text color of the avatar.
- **Default**: `#222222`
- **Example**: `color=fff`
- **Values**: Any valid hex color code

### size

- **Description**: The size of the avatar.
- **Default**: `64`
- **Example**: `size=128`
- **Values**: Any integer between `16` and `512`

### blur

- **Description**: The blur of the avatar.
- **Default**: `0`
- **Example**: `blur=1`
- **Values**: Any integer between `0` and `1`

### font-size

- **Description**: The font size of the text.
- **Default**: `0.5`
- **Example**: `font-size=0.7`
- **Values**: Any decimal between `0.1` and `1`

### font-family

- **Description**: The font family of the text.
- **Default**: `sans`
- **Example**: `font-family=serif`
- **Values**: `mono`, `sans`, `serif` (`mono` is English only)

### length

- **Description**: The length of the text.
- **Default**: `2`
- **Example**: `length=full`
- **Values**: Any positive integer or `full`

### rounded

- **Description**: The border radius of the avatar.
- **Default**: `false`
- **Example**: `rounded=true`
- **Values**: `true`, `false`

### bold

- **Description**: The font weight of the text.
- **Default**: `false`
- **Example**: `bold=true`
- **Values**: `true`, `false`

### uppercase

- **Description**: The text transform of the text.
- **Default**: `true`
- **Example**: `uppercase=false`
- **Values**: `true`, `false`

### format

- **Description**: The format of the image.
- **Default**: `png`
- **Example**: `format=svg`
- **Values**: `png`, `svg`

### rotate

- **Description**: The rotation of the text.
- **Default**: `0`
- **Example**: `rotate=45`
- **Values**: Any integer between `-360` and `360`

### shadow

- **Description**: The text shadow of the text.
- **Default**: `false`
- **Example**: `shadow=true`
- **Values**: `true`, `false`

### border

- **Description**: The border of the avatar.
- **Default**: `false`
- **Example**: `border=0D8ABC`
- **Values**: Any valid hex color code or `false`

### border-style

- **Description**: The border style of the avatar.
- **Default**: `solid`
- **Example**: `border-style=dashed`
- **Values**: `solid`, `dashed`, `dotted`

### border-width

- **Description**: The border width of the avatar.
- **Default**: `0.5`
- **Example**: `border-width=1`
- **Values**: Any decimal between `0.1` and `1`

### opacity

- **Description**: The opacity of the avatar.
- **Default**: `1`
- **Example**: `opacity=0.5`
- **Values**: Any decimal between `0` and `1`

### reverse

- **Description**: The reverse of the text.
- **Default**: `false`
- **Example**: `reverse=true`
- **Values**: `true`, `false`

### oblique

- **Description**: The font style of the text.
- **Default**: `false`
- **Example**: `oblique=true`
- **Values**: `true`, `false`

</details>

## License

`hono-avatars` project is licensed under the [MIT License](LICENSE).

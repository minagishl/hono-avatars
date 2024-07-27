# Hono Avatars

This repository contains code that uses the REST API to generate avatars and return them as images.

## Usage

All requests returns a image stream to be used directly in a `<img/>` tag.

**Generate a avatar with default settings, for user "John Doe".**

```
https://hono-avatars.pages.dev/?name=john+doe
```

**Generate a blue avatar**

```
https://hono-avatars.pages.dev/?background=0D8ABC&color=fff
```

## Parameters

> **Note:** This project is compatible with `ui-avatars.com`, some parameters are not supported but should work the same

- `name` - The name of the user to generate the avatar.
- `background` - The background color of the avatar. Default is `#DDDDDD`.
- `color` - The text color of the avatar. Default is `#222222`.
- `size` - The size of the avatar. Default is `64`.
- `font-size` - The font size of the text. Default is `0.5`.
- `length` - The length of the text. Default is `2`.
- `rounded` - The border radius of the avatar. Default is `false`.
- `bold` - The font weight of the text. Default is `false`.
- `uppercase` - The text transform of the text. Default is `true`.
- `format` - The format of the image. Default is `png`.
- `font-family` - The font family of the text. Default is `sans`.
- `shadow` - The text shadow of the text. Default is `false`.
- `border` - The border of the avatar. Default is `false`.
- `opacity` - The opacity of the avatar. Default is `1`.

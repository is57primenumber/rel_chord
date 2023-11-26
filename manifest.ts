export default {
    "manifest_version": 3,
    "name": "relative chord viewer",
    "version": "0.57.57",
    "content_scripts": [
        {
            "matches": ["*://ja.chordwiki.org/wiki/*"],
            "js": ["src/index.tsx" ]
        }
    ]
}

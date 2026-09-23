# Gift Flap Live

A browser game for OBS or TikTok LIVE Studio. Viewers' gift events can trigger jumps, add wins, or subtract wins through an external TikTok LIVE event bridge.

## Run it

1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run: npm start
4. Open http://localhost:3000
5. Add that URL as a browser source in OBS or TikTok LIVE Studio at 720 x 960.

No npm install is required.

## Test it

Open **Streamer controls** in the lower-right corner. You can test jumps and win changes without connecting TikTok. Space, click, or tap also jumps.

## Connect LIVE gifts

Your TikTok bridge should POST JSON to http://localhost:3000/api/event. Map your chosen gifts to one of these payloads:

~~~json
{"type":"jump","user":"viewer_name"}
{"type":"addWin","user":"viewer_name"}
{"type":"subtractWin","user":"viewer_name"}
~~~

Test with curl:

~~~bash
curl -X POST http://localhost:3000/api/event -H "Content-Type: application/json" -d '{"type":"jump","user":"TestViewer"}'
~~~

TikTok connection is intentionally kept separate because access methods and third-party LIVE bridge support can change. Configure a compatible bridge to send the POST requests above. Do not put account passwords or session credentials in this project.

## Rules included

- Score 20 points to earn one win.
- Three wins trigger the victory screen.
- Wins stay between 0 and 3.
- A configurable jump cooldown prevents gift bursts from making the game uncontrollable.
- Wins persist after refreshing the browser.
- Keyboard and pointer controls are available as backups.

## Notes

- The game displays a completion screen at three wins; it cannot end your TikTok LIVE automatically.
- Explain the gift effects clearly on stream, especially gifts that subtract a win.
- Use only integrations permitted by TikTok's current terms and policies.

varying vec4 worldCoord;
uniform float uShadowIndex;
uniform float uYFactor;
uniform float uYOffset;
uniform float uAudio0;
uniform float uAudio1;
uniform float uAudio2;
uniform float uAudio3;
uniform float uAudio4;

void main(void) {
  vec2 texCoord = cubicvr_texCoord();

  float chan;

  if (mod(texCoord.x/ 3.5, 5.0) < 1.0) {
    chan = uAudio0;
  } else if (mod(texCoord.x/ 3.5, 5.0) < 2.0) {
    chan = uAudio1;
  } else if (mod(texCoord.x/ 3.5, 5.0) < 3.0) {
    chan = uAudio2;
  } else if (mod(texCoord.x/ 3.5, 5.0) < 4.0) {
    chan = uAudio3;
  } else if (mod(texCoord.x/ 3.5, 5.0) < 5.0) {
    chan = uAudio4;
  }

  if (mod(texCoord.x, 3.5) > 0.5 && mod(texCoord.y, 3.0) > 1.1 && (chan * 10.0) > texCoord.y) {
  

    //discard;
    gl_FragColor = vec4(chan,0.5,1.0,1.0);     
  } else {

    vec4 color;
    float dumb = uShadowIndex;
    float c = worldCoord.y/uYFactor + uYOffset;
    //c += fract(sin(dot(texCoord.xy ,vec2(12.9898,78.233))) * 43758.5453) * 0.1;
    c = clamp(c, 0.0, 0.7);
    color.r = color.b = 0.0;
    color.b = c /0.5;
    color.g = c;
    color.a = 1.0;

    vec3 normal = cubicvr_normal(texCoord);
    color = cubicvr_environment(color, normal,texCoord);
    color = cubicvr_lighting(color, normal, texCoord);

    gl_FragColor = color;
  }
}

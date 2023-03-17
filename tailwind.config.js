/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['*'],
  theme: {
    extend: {
      fontFamily:{
        'primary': 'Nunito Sans, sans-serif',
      },
      colors: {
        primary: '#B5A1E5', 
        on_primary: '#100E17', 
        background: '#131214',
        on_background: '#EAE6F2',
        surface: '#1D1C1F',
        on_surface: '#DDDAE5',
        on_surface_variant: '#7B7980', 
        on_surface_variant_2: '#B9B6BF',
        outline: '#3E3D40',
        bg_aqi_1: '#89E589',
        on_bg_aqi_1: '#1F331F',
        bg_aqi_2: '#E5DD89',
        on_bg_aqi_2: '#33311F',
        bg_aqi_3: '#E5C089',
        on_bg_aqi_3: '#332B1F',
        bg_aqi_4: '#E58989',
        on_bg_aqi_4: '#331F1F',
        bg_aqi_5: '#E589B7',
        on_bg_aqi_5: '#331F29',
        white: 'hsl(0, 0%, 100%)',
        white_alpha_4: 'hsla(0, 0%, 100%, 0.04)',
        white_alpha_8: 'hsla(0, 0%, 100%, 0.08)',
        black_alpha_10: 'hsla(0, 0%, 0%, 0.1)',
      },
      backgroundImage:{
        gradient_1: 'linear-gradient(180deg, hsla(270, 5%, 7%, 0) 0%, hsla(270, 5%, 7%, 0.8) 65%, hsl(270, 5%, 7%) 100%)',
        gradient_2: 'linear-gradient(180deg, hsla(260, 5%, 12%, 0) 0%, hsla(260, 5%, 12%, 0.8) 65%, hsl(260, 5%, 12%) 100%)',
      },
      fontSize:{
        heading:'5.6rem',
        title_1:'2rem',
        title_2:'1.8rem',
        title_3:'1.6rem',
        body_1:'2.2rem',
        body_2:'2rem',
        body_3:'1.6rem',
        label_1:'1.4rem',
        label_2:'1.2rem',
      },
      boxShadow:{
        shadow_1:'0px 1px 3px hsla(0, 0%, 0%, 0.5)',
        shadow_2:'0px 3px 6px hsla(0, 0%, 0%, 0.4)',
      },
      borderRadius:{
        radius_28:'28px',
        radius_16:'16px',
        radius_pill:'500px',
        radius_circle:'50%',
      },
      transitionTimingFunction:{
        transition_short:'100ms ease',
      }
    },
  },
  corePlugins:{
    preflight: false,
  },
  plugins: [],
}

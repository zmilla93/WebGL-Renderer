class Perlin {

    static DEFAULT_PERLIN_FREQUENCY = 1.0;
    static DEFAULT_PERLIN_LACUNARITY = 2.0;
    static DEFAULT_PERLIN_OCTAVE_COUNT = 6;
    static DEFAULT_PERLIN_PERSISTENCE = 0.5;
    static DEFAULT_PERLIN_QUALITY = NoiseUtil.NoiseQuality.QUALITY_STD;
    static DEFAULT_PERLIN_SEED = 0;
    static PERLIN_MAX_OCTAVE = 30;

    Frequency = Perlin.DEFAULT_PERLIN_FREQUENCY;
    Lacunarity = Perlin.DEFAULT_PERLIN_LACUNARITY;
    NoiseQuality = Perlin.DEFAULT_PERLIN_QUALITY;
    OctaveCount = Perlin.DEFAULT_PERLIN_OCTAVE_COUNT;
    Persistence = Perlin.DEFAULT_PERLIN_PERSISTENCE;
    Seed = Perlin.DEFAULT_PERLIN_SEED;

    GetSourceModuleCount() {
        return 0;
    }

    GetValue(x,  y, z) {
         var value = 0.0;
         var signal = 0.0;
         var curPersistence = 1.0;
         var nx, ny, nz;
         var seed;

        x *= this.Frequency;
        y *= this.Frequency;
        z *= this.Frequency;

        for (let curOctave = 0; curOctave < this.OctaveCount; curOctave++) {

            // Make sure that these floating-point values have the same range as a 32-
            // bit integer so that we can pass them to the coherent-noise functions.
            nx = NoiseUtil.MakeInt32Range(x);
            ny = NoiseUtil.MakeInt32Range(y);
            nz = NoiseUtil.MakeInt32Range(z);

            // Get the coherent-noise value from the input value and add it to the
            // final result.
            seed = ((this.Seed + curOctave) & 0xffffffff);
            signal = NoiseUtil.GradientCoherentNoise3D(nx, ny, nz, seed, this.NoiseQuality);
            value += signal * curPersistence;

            // Prepare the next octave.
            x *= this.Lacunarity;
            y *= this.Lacunarity;
            z *= this.Lacunarity;
            curPersistence *= this.Persistence;
        }
        return value;
    }
}
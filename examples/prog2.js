function energy() {
    let e = 0;
    const size = bodies.length;

    for (let i = 0; i < size; i++) {
        const bodyi = bodies[i];

        e += 0.5 * bodyi.mass * (bodyi.vx * bodyi.vx + bodyi.vy * bodyi.vy + bodyi.vz * bodyi.vz);

        for (let j = i + 1; j < size; j++) {
            const bodyj = bodies[j];
            const dx = bodyi.x - bodyj.x;
            const dy = bodyi.y - bodyj.y;
            const dz = bodyi.z - bodyj.z;

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            e -= (bodyi.mass * bodyj.mass) / distance;
        }
    }
    return e;
}
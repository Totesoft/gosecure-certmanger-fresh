export function applyFilters({
    roots = [],
    interByRoot = {},
    certsByIntermediate = {},
    rootFilter = "",
    interFilter = "",
    certFilter = ""
} = {}) {

    const toId = (v) =>
        v === null || v === undefined ? "" : String(v).trim().toLowerCase();

    const rf = toId(rootFilter);
    const ifl = toId(interFilter);
    const cf = toId(certFilter);

    // ROOTS
    let filteredRoots = Array.isArray(roots) ? roots.slice() : [];

    filteredRoots = filteredRoots.filter((root) => {
        const val = toId(root?.id);
        return !rf || val.includes(rf);
    });

    const finalInter = {};

    // INTERMEDIATES + CERTS
    filteredRoots.forEach((root) => {
        const rootKey = toId(root.id);
        let interList = interByRoot[rootKey] || [];

        interList = interList.filter((inter) => {
            const val = toId(inter?.id);
            return !ifl || val.includes(ifl);
        });

        const mapped = interList.map((inter) => {
            const interKey = toId(inter.id);
            let certList = certsByIntermediate[interKey] || [];

            certList = certList.filter((c) => {
                const val = toId(c?.id);
                return !cf || val.includes(cf);
            });

            return {
                ...inter,
                issued_certificates: certList
            };
        });

        // keep only intermediates that have certificates
        finalInter[rootKey] = mapped.filter(
            (m) => m.issued_certificates.length > 0
        );
    });

    return { filteredRoots, finalInter };
}

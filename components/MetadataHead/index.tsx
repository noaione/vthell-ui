import MetadataHeadBase from "./Base";
import MetadataHeadPrefetch from "./Prefetch";
import SEOMetaTags from "./SEO";

const MetadataHead = {
    Base: MetadataHeadBase,
    Prefetch: MetadataHeadPrefetch,
    SEO: SEOMetaTags,
};

export default MetadataHead;

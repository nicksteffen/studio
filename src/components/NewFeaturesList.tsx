import NewFeaturesMessage from "./NewFeaturesMessage";

export default function NewFeaturesList() {
    // todo, maybe make this a json file or something to more easily update

    const newFeatureList = [
    { 
        feature: "📢 **New Feedback Hub!** Share your ideas and vote on upcoming features to shape our app's future.", 
        key: 0
    },
    { 
        feature: "🖼️ **Image Configurator!** Customize your list's image generation interactively with our powerful new tool.", 
        key: 1
    },
    { 
        feature: "🔑 **Google Sign-In!** Enjoy seamless, password-free sign-up and login using your existing Gmail account.", 
        key: 2
    },
    { 
        feature: "✅ **Bug Fix: Adding Items!** The issue preventing new items from being added to your lists has been resolved. Add away!", 
        key: 3
    },
];

const version: string = "v1.0.1"; 
const title = "Exciting New Updates Are Here!"; // Or "Introducing Our Latest Enhancements!"
    return (
            <NewFeaturesMessage version={version} title={title}>
                <ul className="list-disc list-inside space-y-2">
                    { newFeatureList.map((featureItem)=> (
                        <li key={featureItem.key}> {featureItem.feature} </li>
                    ))}
                </ul>
        </NewFeaturesMessage>
    )



}
const emojiDisplay = document.getElementById("emoji");

const handRaiseGesture = new fp.GestureDescription('hand_raise');
handRaiseGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
handRaiseGesture.addDirection(fp.Finger.Index, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Middle, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Ring, fp.FingerDirection.VerticalUp, 1.0);
handRaiseGesture.addDirection(fp.Finger.Pinky, fp.FingerDirection.VerticalUp, 1.0);

const thumbsUpGesture = new fp.GestureDescription('thumbs_up');
thumbsUpGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);
thumbsUpGesture.addCurl(fp.Finger.Index, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.HalfCurl, 0.9);
thumbsUpGesture.addDirection(fp.Finger.Thumb, fp.FingerDirection.VerticalUp, 0.9);

const victoryGesture = new fp.GestureDescription('victory');
victoryGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.HalfCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.NoCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 1.0);
victoryGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.FullCurl, 1.0);

async function startHandpose(stream) {
    const video = document.getElementById("video");
    if (stream) {
        const net = await handpose.load();
        console.log("Handpose model loaded.");
        setInterval(() => {
            detect(net, video);
        }, 1000);
    }
}

async function detect(net, video) {
    if (video.srcObject && video.srcObject.getVideoTracks().length > 0) {
        const hand = await net.estimateHands(video);
        if (hand.length > 0) {
            const GE = new fp.GestureEstimator([thumbsUpGesture, handRaiseGesture, victoryGesture]);
            const gesture = await GE.estimate(hand[0].landmarks, 4);
            if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
                const confidence = gesture.gestures.map((prediction) => prediction.score);
                const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence));
                const maxConfidenceGesture = gesture.gestures[maxConfidence];
                const isThumbUp = isThumbsUp(hand[0].landmarks);

                if (maxConfidenceGesture.name === "victory" && maxConfidenceGesture.score >= 8.0) {
                    displayEmoji("✌️");
                } else if (maxConfidenceGesture.name === "hand_raise" && maxConfidenceGesture.score >= 9.0) {
                    displayEmoji("✋");
                } else if (maxConfidenceGesture.name === "thumbs_up" && maxConfidenceGesture.score >= 8.0 && isThumbUp) {
                    displayEmoji("👍");
                }
            }
        } else {
            displayEmoji(null);
        }
    }
}

function isThumbsUp(keypoints) {
    const thumbTip = keypoints[4];
    const indexTip = keypoints[8];
    const middleTip = keypoints[12];

    return thumbTip[1] < indexTip[1] && thumbTip[1] < middleTip[1] && thumbTip[2] > 0;
}

function displayEmoji(emoji) {
    emojiDisplay.textContent = emoji;
    emojiDisplay.style.display = emoji ? "block" : "none";
}

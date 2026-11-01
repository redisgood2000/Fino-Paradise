using UnityEngine;

namespace FinoParadise.World
{
    public sealed class RemoteAvatarView : MonoBehaviour
    {
        [SerializeField] private float interpolationSpeed = 12f;
        private Vector3 targetPosition;

        private void Awake()
        {
            targetPosition = transform.position;
        }

        public void SetServerPosition(float x, float y)
        {
            targetPosition = new Vector3(x, y, transform.position.z);
        }

        private void Update()
        {
            transform.position = Vector3.Lerp(
                transform.position,
                targetPosition,
                1f - Mathf.Exp(-interpolationSpeed * Time.deltaTime));
        }
    }
}

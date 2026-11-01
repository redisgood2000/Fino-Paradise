using UnityEngine;

namespace FinoParadise.World
{
    public sealed class WorldInput : MonoBehaviour
    {
        [SerializeField] private IsometricPlayerController player;
        private Vector2 mobileDirection;

        public void SetMobileDirection(Vector2 direction)
        {
            mobileDirection = Vector2.ClampMagnitude(direction, 1f);
        }

        private void Update()
        {
            if (player == null) return;

            Vector2 keyboard = new Vector2(
                Input.GetAxisRaw("Horizontal"),
                Input.GetAxisRaw("Vertical"));

            Vector2 direction = keyboard.sqrMagnitude > 0.001f
                ? Vector2.ClampMagnitude(keyboard, 1f)
                : mobileDirection;

            player.SetInput(direction);
        }
    }
}

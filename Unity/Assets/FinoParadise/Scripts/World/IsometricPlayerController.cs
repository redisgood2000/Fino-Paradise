using UnityEngine;

namespace FinoParadise.World
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class IsometricPlayerController : MonoBehaviour
    {
        [SerializeField] private float moveSpeed = 3.0f;
        [SerializeField] private Animator animator;

        private Rigidbody2D body;
        private Vector2 input;

        public Vector2 WorldPosition => body.position;
        public Vector2 InputDirection => input;

        private void Awake()
        {
            body = GetComponent<Rigidbody2D>();
            body.gravityScale = 0f;
            body.freezeRotation = true;
            body.interpolation = RigidbodyInterpolation2D.Interpolate;
        }

        public void SetInput(Vector2 direction)
        {
            input = Vector2.ClampMagnitude(direction, 1f);
        }

        private void FixedUpdate()
        {
            // Convert cardinal input to a diamond/isometric world projection.
            Vector2 projected = new Vector2(input.x - input.y, (input.x + input.y) * 0.5f);
            Vector2 velocity = Vector2.ClampMagnitude(projected, 1f) * moveSpeed;
            body.MovePosition(body.position + velocity * Time.fixedDeltaTime);

            if (animator != null)
            {
                animator.SetFloat("MoveX", projected.x);
                animator.SetFloat("MoveY", projected.y);
                animator.SetFloat("Speed", input.sqrMagnitude);
            }
        }
    }
}

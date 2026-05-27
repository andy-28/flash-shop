namespace FlashShop.Application.Common.Interfaces;

public interface ICacheStatusService
{
    void SetHit();
    void SetMiss();
}
